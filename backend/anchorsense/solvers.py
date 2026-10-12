"""
Position solvers for 2D range-based indoor localisation.

Two estimators:
  1. Ordinary Nonlinear Least Squares (NLS)  — baseline
  2. Robust Nonlinear Least Squares          — Huber / soft-L1 loss

Both use scipy.optimize.least_squares and share the same input/output contract.

Coordinate convention: (x, y) in metres.
"""

from __future__ import annotations

import math
from typing import Optional, Sequence

import numpy as np
from scipy.optimize import least_squares, OptimizeResult

from .models import (
    Anchor,
    EstimateStatus,
    PositionEstimate,
    RangeMeasurement,
    RoomGeometry,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _prepare_inputs(
    measurements: Sequence[RangeMeasurement],
    anchors: Sequence[Anchor],
) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """
    Extract valid (non-missing, finite) anchor coordinates and measured ranges.

    Returns
    -------
    anchor_xy : (M, 2) array of anchor (x, y) positions
    ranges    : (M,)   array of measured ranges
    ids       : list of anchor IDs used
    """
    anchor_map = {a.id: a for a in anchors}
    ax, ay, rr, ids = [], [], [], []

    for m in measurements:
        if m.measured_range is None:
            continue
        if not math.isfinite(m.measured_range):
            continue
        if m.anchor_id not in anchor_map:
            continue
        a = anchor_map[m.anchor_id]
        ax.append(a.x)
        ay.append(a.y)
        rr.append(m.measured_range)
        ids.append(m.anchor_id)

    return (
        np.column_stack([ax, ay]) if ax else np.empty((0, 2)),
        np.array(rr) if rr else np.empty(0),
        ids,
    )


def _initial_guess(
    anchor_xy: np.ndarray,
    ranges: np.ndarray,
    room: RoomGeometry,
) -> np.ndarray:
    """
    Heuristic initial position for the solver.

    Strategy: weighted centroid of anchor positions, where weights are
    the inverse of measured ranges (closer anchors get more weight).
    Falls back to room centre if weights degenerate.

    Does NOT use ground truth.
    """
    if len(anchor_xy) == 0:
        return np.array([room.width / 2.0, room.length / 2.0])

    safe_ranges = np.maximum(ranges, 0.01)
    weights = np.where(ranges > 0.01, 1.0 / safe_ranges, 1.0)
    weights /= weights.sum()
    guess = weights @ anchor_xy

    # Clamp to room
    guess[0] = np.clip(guess[0], 0.0, room.width)
    guess[1] = np.clip(guess[1], 0.0, room.length)
    return guess


def _check_geometry(anchor_xy: np.ndarray) -> bool:
    """
    Check whether the anchor geometry can support a 2D position fix.

    Requires anchors to not all be collinear. Uses the rank of the
    centred anchor matrix.
    """
    if len(anchor_xy) < 3:
        return False
    centred = anchor_xy - anchor_xy.mean(axis=0)
    _, s, _ = np.linalg.svd(centred, full_matrices=False)
    # If the second singular value is negligible, anchors are ~collinear
    return s[1] > 1e-6


# ---------------------------------------------------------------------------
# Residual function
# ---------------------------------------------------------------------------

def _range_residuals(
    pos: np.ndarray,
    anchor_xy: np.ndarray,
    ranges: np.ndarray,
) -> np.ndarray:
    """
    Residual vector: predicted_range_i - measured_range_i
    for each anchor i.
    """
    dx = anchor_xy[:, 0] - pos[0]
    dy = anchor_xy[:, 1] - pos[1]
    predicted = np.sqrt(dx**2 + dy**2)
    return predicted - ranges


# ---------------------------------------------------------------------------
# Ordinary Nonlinear Least Squares (baseline)
# ---------------------------------------------------------------------------

def solve_nls(
    measurements: Sequence[RangeMeasurement],
    anchors: Sequence[Anchor],
    timestamp: float,
    room: RoomGeometry = RoomGeometry(),
) -> PositionEstimate:
    """
    Estimate 2D position by ordinary nonlinear least squares.

    Uses scipy.optimize.least_squares with loss='linear' (ordinary sum
    of squared residuals) and the Trust Region Reflective method.
    """
    anchor_xy, ranges, ids = _prepare_inputs(measurements, anchors)
    n_valid = len(ranges)

    if n_valid < 3:
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.INSUFFICIENT_MEASUREMENTS,
            num_valid_measurements=n_valid,
            convergence_message=f"Only {n_valid} valid range(s); need >= 3",
        )

    if not _check_geometry(anchor_xy):
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.POOR_GEOMETRY,
            num_valid_measurements=n_valid,
            convergence_message="Anchors are approximately collinear",
        )

    x0 = _initial_guess(anchor_xy, ranges, room)

    try:
        result: OptimizeResult = least_squares(
            _range_residuals,
            x0,
            args=(anchor_xy, ranges),
            method="trf",
            loss="linear",
            bounds=([0, 0], [room.width, room.length]),
        )
    except Exception as exc:
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.SOLVER_FAILED,
            num_valid_measurements=n_valid,
            convergence_message=str(exc),
        )

    if not result.success:
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.SOLVER_FAILED,
            num_valid_measurements=n_valid,
            solver_cost=float(result.cost),
            convergence_message=result.message,
        )

    est_x, est_y = float(result.x[0]), float(result.x[1])
    if not (math.isfinite(est_x) and math.isfinite(est_y)):
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.SOLVER_FAILED,
            num_valid_measurements=n_valid,
            convergence_message="Non-finite result coordinates",
        )

    return PositionEstimate(
        timestamp=timestamp,
        x=est_x,
        y=est_y,
        status=EstimateStatus.VALID,
        solver_cost=float(result.cost),
        num_valid_measurements=n_valid,
        residuals=result.fun.copy(),
        convergence_message=result.message,
    )


# ---------------------------------------------------------------------------
# Robust Nonlinear Least Squares
# ---------------------------------------------------------------------------

def solve_robust_nls(
    measurements: Sequence[RangeMeasurement],
    anchors: Sequence[Anchor],
    timestamp: float,
    room: RoomGeometry = RoomGeometry(),
    loss: str = "huber",
    f_scale: float = 0.5,
) -> PositionEstimate:
    """
    Estimate 2D position using robust nonlinear least squares.

    Uses scipy.optimize.least_squares with a configurable robust loss
    function (default: Huber with f_scale=0.5 m).  The robust loss
    reduces the influence of large residuals caused by outliers, but
    does NOT guarantee superior accuracy in every scenario compared
    to ordinary least squares — particularly under systematic biases
    or clean measurements.

    Parameters
    ----------
    loss : str
        Loss function name accepted by scipy.optimize.least_squares,
        e.g. 'huber', 'soft_l1', 'cauchy', 'arctan'.
    f_scale : float
        Value of soft margin between inlier and outlier residuals (metres).
    """
    SUPPORTED_ROBUST_LOSSES = {"linear", "soft_l1", "huber", "cauchy", "arctan"}
    if loss not in SUPPORTED_ROBUST_LOSSES:
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.INVALID_INPUT,
            num_valid_measurements=0,
            convergence_message=f"Unsupported loss '{loss}'; expected one of {sorted(SUPPORTED_ROBUST_LOSSES)}",
        )

    if f_scale <= 0:
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.INVALID_INPUT,
            num_valid_measurements=0,
            convergence_message="f_scale must be positive",
        )

    anchor_xy, ranges, ids = _prepare_inputs(measurements, anchors)
    n_valid = len(ranges)

    if n_valid < 3:
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.INSUFFICIENT_MEASUREMENTS,
            num_valid_measurements=n_valid,
            convergence_message=f"Only {n_valid} valid range(s); need >= 3",
        )

    if not _check_geometry(anchor_xy):
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.POOR_GEOMETRY,
            num_valid_measurements=n_valid,
            convergence_message="Anchors are approximately collinear",
        )

    x0 = _initial_guess(anchor_xy, ranges, room)

    try:
        result: OptimizeResult = least_squares(
            _range_residuals,
            x0,
            args=(anchor_xy, ranges),
            method="trf",
            loss=loss,
            f_scale=f_scale,
            bounds=([0, 0], [room.width, room.length]),
        )
    except Exception as exc:
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.SOLVER_FAILED,
            num_valid_measurements=n_valid,
            convergence_message=str(exc),
        )

    if not result.success:
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.SOLVER_FAILED,
            num_valid_measurements=n_valid,
            solver_cost=float(result.cost),
            convergence_message=result.message,
        )

    est_x, est_y = float(result.x[0]), float(result.x[1])
    if not (math.isfinite(est_x) and math.isfinite(est_y)):
        return PositionEstimate(
            timestamp=timestamp,
            status=EstimateStatus.SOLVER_FAILED,
            num_valid_measurements=n_valid,
            convergence_message="Non-finite result coordinates",
        )

    return PositionEstimate(
        timestamp=timestamp,
        x=est_x,
        y=est_y,
        status=EstimateStatus.VALID,
        solver_cost=float(result.cost),
        num_valid_measurements=n_valid,
        residuals=result.fun.copy(),
        convergence_message=result.message,
    )
