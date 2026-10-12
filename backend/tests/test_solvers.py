"""Tests for the NLS and robust NLS position solvers."""

import math

import numpy as np
import pytest

from anchorsense.models import (
    Anchor,
    EstimateStatus,
    RangeMeasurement,
    RoomGeometry,
)
from anchorsense.solvers import solve_nls, solve_robust_nls


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

# Well-distributed anchors for non-degenerate geometry
GOOD_ANCHORS = (
    Anchor(id="A1", x=0.5,  y=0.5,  z=2.8),
    Anchor(id="A2", x=11.5, y=0.5,  z=2.8),
    Anchor(id="A3", x=11.5, y=7.5,  z=2.8),
    Anchor(id="A4", x=0.5,  y=7.5,  z=2.8),
    Anchor(id="A5", x=6.0,  y=0.2,  z=3.2),
    Anchor(id="A6", x=6.0,  y=7.8,  z=3.2),
)

ROOM = RoomGeometry()

# Known target position for noise-free tests
KNOWN_X, KNOWN_Y = 6.0, 4.0


def _noise_free_measurements(
    x: float, y: float, anchors: tuple[Anchor, ...],
) -> list[RangeMeasurement]:
    """Generate perfect measurements from a known position."""
    measurements = []
    for a in anchors:
        true_range = math.sqrt((x - a.x)**2 + (y - a.y)**2)
        measurements.append(RangeMeasurement(
            anchor_id=a.id,
            true_range=true_range,
            measured_range=true_range,
        ))
    return measurements


def _noisy_measurements(
    x: float, y: float, anchors: tuple[Anchor, ...], noise: float = 0.1,
    seed: int = 42,
) -> list[RangeMeasurement]:
    """Generate measurements with small Gaussian noise."""
    rng = np.random.default_rng(seed)
    measurements = []
    for a in anchors:
        true_range = math.sqrt((x - a.x)**2 + (y - a.y)**2)
        measured = true_range + rng.normal(0, noise)
        measurements.append(RangeMeasurement(
            anchor_id=a.id,
            true_range=true_range,
            measured_range=max(0, measured),
        ))
    return measurements


# ---------------------------------------------------------------------------
# Ordinary NLS tests
# ---------------------------------------------------------------------------

class TestSolveNLS:
    """Tests for the ordinary nonlinear least squares solver."""

    def test_noise_free_recovery(self):
        """Recover exact position from perfect measurements within tolerance."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        result = solve_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.VALID
        assert result.x is not None and result.y is not None
        assert abs(result.x - KNOWN_X) < 0.01, f"x={result.x}, expected {KNOWN_X}"
        assert abs(result.y - KNOWN_Y) < 0.01, f"y={result.y}, expected {KNOWN_Y}"

    def test_noisy_recovery(self):
        """Solve converges under moderate noise."""
        meas = _noisy_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS, noise=0.15)
        result = solve_nls(meas, GOOD_ANCHORS, timestamp=1.0, room=ROOM)
        assert result.status == EstimateStatus.VALID
        assert result.x is not None and result.y is not None
        # Expect error < 1 m for moderate noise with 6 anchors
        err = math.sqrt((result.x - KNOWN_X)**2 + (result.y - KNOWN_Y)**2)
        assert err < 1.0, f"Error {err:.3f} m too large"

    def test_insufficient_measurements_two_ranges(self):
        """Two measurements → insufficient_measurements."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS[:2])
        result = solve_nls(meas, GOOD_ANCHORS[:2], timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.INSUFFICIENT_MEASUREMENTS

    def test_insufficient_measurements_one_range(self):
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS[:1])
        result = solve_nls(meas, GOOD_ANCHORS[:1], timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.INSUFFICIENT_MEASUREMENTS

    def test_all_missing_measurements(self):
        """All measurements are None → insufficient."""
        meas = [
            RangeMeasurement(anchor_id=a.id, true_range=5.0, measured_range=None, is_dropout=True)
            for a in GOOD_ANCHORS
        ]
        result = solve_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.INSUFFICIENT_MEASUREMENTS
        assert result.x is None
        assert result.y is None

    def test_collinear_anchors_detected(self):
        """Three collinear anchors → poor_geometry."""
        collinear = (
            Anchor(id="C1", x=1.0, y=4.0),
            Anchor(id="C2", x=5.0, y=4.0),
            Anchor(id="C3", x=9.0, y=4.0),
        )
        meas = _noise_free_measurements(6.0, 4.0, collinear)
        result = solve_nls(meas, collinear, timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.POOR_GEOMETRY

    def test_nan_measurement_rejected(self):
        """NaN measurement values are filtered out."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        # Corrupt 4 of 6 to NaN → only 2 valid → insufficient
        for m in meas[:4]:
            m.measured_range = float("nan")
        result = solve_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.INSUFFICIENT_MEASUREMENTS

    def test_inf_measurement_rejected(self):
        """Inf measurement values are filtered out."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        for m in meas[:4]:
            m.measured_range = float("inf")
        result = solve_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.INSUFFICIENT_MEASUREMENTS

    def test_finite_output(self):
        """Valid results always have finite coordinates."""
        meas = _noisy_measurements(3.0, 6.0, GOOD_ANCHORS, noise=0.2)
        result = solve_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        if result.status == EstimateStatus.VALID:
            assert math.isfinite(result.x)
            assert math.isfinite(result.y)

    def test_result_has_diagnostics(self):
        """Valid result includes solver cost and residuals."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        result = solve_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        assert result.solver_cost is not None
        assert result.residuals is not None
        assert result.num_valid_measurements == 6

    def test_corner_position(self):
        """Solver handles a target near the room corner."""
        meas = _noise_free_measurements(0.5, 0.5, GOOD_ANCHORS)
        result = solve_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.VALID
        assert abs(result.x - 0.5) < 0.05
        assert abs(result.y - 0.5) < 0.05


# ---------------------------------------------------------------------------
# Robust NLS tests
# ---------------------------------------------------------------------------

class TestSolveRobustNLS:
    """Tests for the robust nonlinear least squares solver."""

    def test_noise_free_recovery(self):
        """Recover exact position from perfect measurements."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        result = solve_robust_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.VALID
        assert abs(result.x - KNOWN_X) < 0.01
        assert abs(result.y - KNOWN_Y) < 0.01

    def test_noisy_recovery(self):
        meas = _noisy_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS, noise=0.15)
        result = solve_robust_nls(meas, GOOD_ANCHORS, timestamp=1.0, room=ROOM)
        assert result.status == EstimateStatus.VALID
        err = math.sqrt((result.x - KNOWN_X)**2 + (result.y - KNOWN_Y)**2)
        assert err < 1.0

    def test_with_outlier_measurement(self):
        """Robust solver should remain stable even with a large outlier."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        # Inject a large outlier on A1
        meas[0].measured_range += 10.0
        result = solve_robust_nls(
            meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM,
            loss="huber", f_scale=0.5,
        )
        assert result.status == EstimateStatus.VALID
        assert result.x is not None and result.y is not None
        # Should still be somewhat reasonable (within a few metres)
        err = math.sqrt((result.x - KNOWN_X)**2 + (result.y - KNOWN_Y)**2)
        assert err < 3.0, f"Robust solver error {err:.3f} m is too large with outlier"

    def test_insufficient_measurements(self):
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS[:2])
        result = solve_robust_nls(meas, GOOD_ANCHORS[:2], timestamp=0.0, room=ROOM)
        assert result.status == EstimateStatus.INSUFFICIENT_MEASUREMENTS

    def test_soft_l1_loss(self):
        """Solver works with soft_l1 loss function."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        result = solve_robust_nls(
            meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM,
            loss="soft_l1", f_scale=1.0,
        )
        assert result.status == EstimateStatus.VALID
        assert abs(result.x - KNOWN_X) < 0.05
        assert abs(result.y - KNOWN_Y) < 0.05

    def test_large_residuals_numerical_stability(self):
        """Robust loss remains stable with very large residuals."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        # Corrupt multiple measurements with huge offsets
        meas[0].measured_range += 50.0
        meas[1].measured_range += 30.0
        result = solve_robust_nls(
            meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM,
            loss="huber", f_scale=0.3,
        )
        # Solver should not crash; status may be VALID or SOLVER_FAILED
        assert result.status in (
            EstimateStatus.VALID,
            EstimateStatus.SOLVER_FAILED,
        )
        if result.status == EstimateStatus.VALID:
            assert math.isfinite(result.x) and math.isfinite(result.y)

    def test_comparable_output_structure(self):
        """Both solvers return the same field structure."""
        meas = _noise_free_measurements(KNOWN_X, KNOWN_Y, GOOD_ANCHORS)
        r1 = solve_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        r2 = solve_robust_nls(meas, GOOD_ANCHORS, timestamp=0.0, room=ROOM)
        # Both should have the same set of attributes
        assert set(vars(r1).keys()) == set(vars(r2).keys())
