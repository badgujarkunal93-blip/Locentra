"""Tests for the evaluation metrics module."""

import math

import numpy as np
import pytest

from anchorsense.metrics import compute_metrics
from anchorsense.models import EstimateStatus, PipelineMetrics, PositionEstimate


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _est(ts: float, x: float, y: float) -> PositionEstimate:
    return PositionEstimate(timestamp=ts, x=x, y=y, status=EstimateStatus.VALID)


def _failed_est(ts: float) -> PositionEstimate:
    return PositionEstimate(
        timestamp=ts, status=EstimateStatus.INSUFFICIENT_MEASUREMENTS,
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestComputeMetrics:

    def test_perfect_estimates(self):
        """Zero error when estimates match ground truth exactly."""
        estimates = [_est(0, 1.0, 2.0), _est(1, 3.0, 4.0)]
        gt_xs = np.array([1.0, 3.0])
        gt_ys = np.array([2.0, 4.0])
        m = compute_metrics(estimates, gt_xs, gt_ys)
        assert m.mean_error_m == pytest.approx(0.0, abs=1e-10)
        assert m.median_error_m == pytest.approx(0.0, abs=1e-10)
        assert m.rmse_m == pytest.approx(0.0, abs=1e-10)
        assert m.valid_estimate_rate == pytest.approx(1.0)
        assert m.valid_count == 2
        assert m.failed_count == 0
        assert m.total_count == 2

    def test_known_errors(self):
        """Hand-calculated error values."""
        # Point 1: (1,0) vs GT (0,0) → error = 1.0
        # Point 2: (0,1) vs GT (0,0) → error = 1.0
        estimates = [_est(0, 1.0, 0.0), _est(1, 0.0, 1.0)]
        gt_xs = np.array([0.0, 0.0])
        gt_ys = np.array([0.0, 0.0])
        m = compute_metrics(estimates, gt_xs, gt_ys)
        assert m.mean_error_m == pytest.approx(1.0, abs=1e-10)
        assert m.median_error_m == pytest.approx(1.0, abs=1e-10)
        assert m.rmse_m == pytest.approx(1.0, abs=1e-10)

    def test_mixed_valid_and_failed(self):
        """Failed estimates counted in denominator."""
        estimates = [
            _est(0, 1.0, 0.0),     # error = 1.0
            _failed_est(1),          # failed
            _est(2, 0.0, 0.0),     # error = 0.0
        ]
        gt_xs = np.array([0.0, 5.0, 0.0])
        gt_ys = np.array([0.0, 5.0, 0.0])
        m = compute_metrics(estimates, gt_xs, gt_ys)

        assert m.total_count == 3
        assert m.valid_count == 2
        assert m.failed_count == 1
        assert m.valid_estimate_rate == pytest.approx(2.0 / 3.0)
        assert m.failure_rate == pytest.approx(1.0 / 3.0)
        # Mean error over valid only: (1.0 + 0.0) / 2 = 0.5
        assert m.mean_error_m == pytest.approx(0.5, abs=1e-10)

    def test_all_failed(self):
        """All estimates failed → error stats are None."""
        estimates = [_failed_est(0), _failed_est(1)]
        gt_xs = np.array([1.0, 2.0])
        gt_ys = np.array([1.0, 2.0])
        m = compute_metrics(estimates, gt_xs, gt_ys)
        assert m.valid_count == 0
        assert m.failed_count == 2
        assert m.total_count == 2
        assert m.valid_estimate_rate == pytest.approx(0.0)
        assert m.failure_rate == pytest.approx(1.0)
        assert m.mean_error_m is None
        assert m.median_error_m is None
        assert m.p95_error_m is None
        assert m.rmse_m is None

    def test_empty_input(self):
        """Empty input → total_count=0, no crash."""
        m = compute_metrics([], np.array([]), np.array([]))
        assert m.total_count == 0
        assert m.valid_count == 0
        assert m.mean_error_m is None

    def test_length_mismatch_raises(self):
        """Mismatched lengths raise ValueError."""
        estimates = [_est(0, 1.0, 1.0)]
        with pytest.raises(ValueError):
            compute_metrics(estimates, np.array([1.0, 2.0]), np.array([1.0]))

    def test_p95_percentile(self):
        """95th percentile is calculated correctly on a small known set."""
        # 20 estimates with errors: 0.0 to 1.9 (step 0.1)
        estimates = [_est(i, float(i) * 0.1, 0.0) for i in range(20)]
        gt_xs = np.zeros(20)
        gt_ys = np.zeros(20)
        m = compute_metrics(estimates, gt_xs, gt_ys)
        # Errors = [0.0, 0.1, 0.2, ..., 1.9]
        # 95th percentile of np.arange(0, 2, 0.1) ≈ 1.805
        assert m.p95_error_m is not None
        assert m.p95_error_m > 1.5

    def test_failed_estimates_not_treated_as_zero(self):
        """Failed estimates do NOT contribute zero error to the statistics."""
        estimates = [
            _failed_est(0),
            _est(1, 1.0, 0.0),  # error = 1.0
        ]
        gt_xs = np.array([0.0, 0.0])
        gt_ys = np.array([0.0, 0.0])
        m = compute_metrics(estimates, gt_xs, gt_ys)
        # If failed were treated as (0,0) error=0, mean would be 0.5
        # Correct: mean over valid only = 1.0
        assert m.mean_error_m == pytest.approx(1.0, abs=1e-10)
        assert m.valid_count == 1
