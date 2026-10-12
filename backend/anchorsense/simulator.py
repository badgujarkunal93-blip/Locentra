"""
Synthetic trajectory generator and range-measurement simulator.

Generates deterministic trajectories and corrupted range observations
using a seeded random number generator for full reproducibility.

Coordinate convention: x ∈ [0, room.width], y ∈ [0, room.length] — metres.
"""

from __future__ import annotations

import math
from typing import Optional

import numpy as np

from .models import (
    Anchor,
    RangeMeasurement,
    RoomGeometry,
    SimulationConfig,
    TrajectoryType,
)


# ---------------------------------------------------------------------------
# Trajectory generation
# ---------------------------------------------------------------------------

def _generate_closed_loop(
    cfg: SimulationConfig,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Lemniscate / figure-8 closed loop, matching the frontend convention."""
    t = np.linspace(0, 2 * math.pi, cfg.num_points, endpoint=False)
    cx, cy = cfg.room.width / 2.0, cfg.room.length / 2.0
    rx = cfg.room.width / 2.0 - 1.8   # margin from walls
    ry = cfg.room.length / 2.0 - 1.5
    xs = cx + rx * np.sin(t)
    ys = cy + (ry * np.sin(2 * t)) / 1.7
    ts = np.arange(cfg.num_points) * cfg.sampling_interval
    return xs, ys, ts


def _generate_straight_line(
    cfg: SimulationConfig,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Diagonal walk from corner margin to opposite corner margin."""
    margin = 1.0
    xs = np.linspace(margin, cfg.room.width - margin, cfg.num_points)
    ys = np.linspace(margin, cfg.room.length - margin, cfg.num_points)
    ts = np.arange(cfg.num_points) * cfg.sampling_interval
    return xs, ys, ts


def _generate_curved(
    cfg: SimulationConfig,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Sinusoidal variable-direction path along the room."""
    margin = 1.0
    t_param = np.linspace(0, 1, cfg.num_points)
    xs = margin + (cfg.room.width - 2 * margin) * t_param
    amplitude = (cfg.room.length - 2 * margin) / 2.0
    ys = cfg.room.length / 2.0 + amplitude * np.sin(2 * math.pi * t_param)
    ts = np.arange(cfg.num_points) * cfg.sampling_interval
    return xs, ys, ts


_TRAJECTORY_GENERATORS = {
    TrajectoryType.CLOSED_LOOP: _generate_closed_loop,
    TrajectoryType.STRAIGHT_LINE: _generate_straight_line,
    TrajectoryType.CURVED: _generate_curved,
}


def generate_trajectory(
    cfg: SimulationConfig,
    trajectory_type: TrajectoryType = TrajectoryType.CLOSED_LOOP,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Generate a 2D ground-truth trajectory within the room.

    Returns
    -------
    xs : ndarray of shape (N,) — ground-truth x positions (metres)
    ys : ndarray of shape (N,) — ground-truth y positions (metres)
    ts : ndarray of shape (N,) — timestamps (seconds)
    """
    gen = _TRAJECTORY_GENERATORS.get(trajectory_type)
    if gen is None:
        raise ValueError(f"Unknown trajectory type: {trajectory_type}")
    xs, ys, ts = gen(cfg)

    # Clamp to room boundaries (safety)
    xs = np.clip(xs, 0.0, cfg.room.width)
    ys = np.clip(ys, 0.0, cfg.room.length)
    return xs, ys, ts


# ---------------------------------------------------------------------------
# Range measurement simulation
# ---------------------------------------------------------------------------

def _euclidean_range_2d_to_anchor(
    x: float, y: float, anchor: Anchor, target_z: float,
) -> float:
    """3D Euclidean distance between a 2D target position and an anchor."""
    return math.sqrt(
        (x - anchor.x) ** 2 +
        (y - anchor.y) ** 2 +
        (target_z - anchor.z) ** 2
    )


def generate_measurements(
    xs: np.ndarray,
    ys: np.ndarray,
    ts: np.ndarray,
    cfg: SimulationConfig,
) -> list[list[RangeMeasurement]]:
    """
    Generate corrupted range measurements for every position and active anchor.

    Returns
    -------
    measurements : list[list[RangeMeasurement]]
        Outer list indexed by time step.
        Inner list: one RangeMeasurement per anchor (including inactive ones
        which are always dropped).

    Missing measurements have measured_range = None.
    """
    rng = np.random.default_rng(cfg.seed)
    n = len(xs)
    active_anchors = [a for a in cfg.anchors if a.is_active]

    all_measurements: list[list[RangeMeasurement]] = []

    for i in range(n):
        epoch: list[RangeMeasurement] = []
        for anchor in cfg.anchors:
            true_range = _euclidean_range_2d_to_anchor(
                xs[i], ys[i], anchor, cfg.target_z,
            )

            if not anchor.is_active:
                epoch.append(RangeMeasurement(
                    anchor_id=anchor.id,
                    true_range=true_range,
                    measured_range=None,
                    is_dropout=True,
                ))
                continue

            # Dropout
            is_dropout = rng.random() < cfg.dropout_rate
            if is_dropout:
                epoch.append(RangeMeasurement(
                    anchor_id=anchor.id,
                    true_range=true_range,
                    measured_range=None,
                    is_dropout=True,
                ))
                continue

            measured = true_range

            # Gaussian noise
            measured += rng.normal(0, cfg.noise_std_dev)

            # NLOS positive bias (exponential)
            is_nlos = rng.random() < cfg.nlos_rate
            if is_nlos:
                measured += rng.exponential(cfg.nlos_bias_mean)

            # Outlier (large positive spike)
            is_outlier = rng.random() < cfg.outlier_rate
            if is_outlier:
                measured += rng.uniform(1.0, cfg.outlier_magnitude)

            # Ranges cannot be negative
            measured = max(0.0, measured)

            epoch.append(RangeMeasurement(
                anchor_id=anchor.id,
                true_range=true_range,
                measured_range=measured,
                is_nlos=is_nlos,
                is_outlier=is_outlier,
                is_dropout=False,
            ))

        all_measurements.append(epoch)

    return all_measurements
