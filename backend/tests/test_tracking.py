"""Tests for the constant-velocity 2D Kalman filter."""

import numpy as np
import pytest

from anchorsense.models import EstimateStatus, PositionEstimate
from anchorsense.tracking import KalmanConfig, KalmanTracker


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _valid_estimate(ts: float, x: float, y: float) -> PositionEstimate:
    return PositionEstimate(
        timestamp=ts, x=x, y=y, status=EstimateStatus.VALID,
        num_valid_measurements=6,
    )


def _invalid_estimate(ts: float) -> PositionEstimate:
    return PositionEstimate(
        timestamp=ts, status=EstimateStatus.INSUFFICIENT_MEASUREMENTS,
        num_valid_measurements=1,
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestKalmanTracker:

    def test_initialise_on_first_valid(self):
        """Filter initialises on the first valid observation."""
        tracker = KalmanTracker()
        tracker.reset()
        result = tracker.step(_valid_estimate(0.0, 6.0, 4.0))
        assert result.status == EstimateStatus.VALID
        assert result.x == pytest.approx(6.0, abs=0.01)
        assert result.y == pytest.approx(4.0, abs=0.01)
        assert result.is_kalman_updated is True
        assert tracker.is_initialised

    def test_uninitialised_without_valid(self):
        """Filter remains uninitialised without a valid observation."""
        tracker = KalmanTracker()
        tracker.reset()
        result = tracker.step(_invalid_estimate(0.0))
        assert not tracker.is_initialised
        assert result.is_kalman_updated is False

    def test_time_aware_transition(self):
        """Position updates correctly using the time delta."""
        tracker = KalmanTracker(KalmanConfig(process_noise_std=0.1))
        tracker.reset()
        # Initialise at (0, 0)
        tracker.step(_valid_estimate(0.0, 0.0, 0.0))
        # Move to (1, 0) at t=1
        result = tracker.step(_valid_estimate(1.0, 1.0, 0.0))
        assert result.status == EstimateStatus.VALID
        assert result.x is not None
        # After update, x should be near 1.0
        assert abs(result.x - 1.0) < 0.5

    def test_valid_measurement_updates_state(self):
        """A valid measurement causes a Kalman update."""
        tracker = KalmanTracker()
        tracker.reset()
        tracker.step(_valid_estimate(0.0, 5.0, 5.0))
        result = tracker.step(_valid_estimate(0.25, 5.1, 5.0))
        assert result.is_kalman_updated is True

    def test_missing_observation_prediction_only(self):
        """Missing observations trigger prediction-only behaviour."""
        tracker = KalmanTracker()
        tracker.reset()
        tracker.step(_valid_estimate(0.0, 6.0, 4.0))
        result = tracker.step(_invalid_estimate(0.25))
        assert result.is_kalman_updated is False
        # Should still produce a position (predicted)
        assert result.x is not None
        assert result.y is not None

    def test_covariance_grows_during_prediction(self):
        """Covariance increases during prediction-only intervals."""
        tracker = KalmanTracker()
        tracker.reset()
        tracker.step(_valid_estimate(0.0, 6.0, 4.0))
        P_after_init = tracker.covariance.copy()

        # Several prediction-only steps
        for i in range(1, 6):
            tracker.step(_invalid_estimate(i * 0.25))

        P_after_prediction = tracker.covariance.copy()
        # Position uncertainty (top-left 2x2) should have grown
        assert P_after_prediction[0, 0] > P_after_init[0, 0]
        assert P_after_prediction[1, 1] > P_after_init[1, 1]

    def test_reset_between_trajectories(self):
        """Reset clears the filter state."""
        tracker = KalmanTracker()
        tracker.reset()
        tracker.step(_valid_estimate(0.0, 6.0, 4.0))
        assert tracker.is_initialised

        tracker.reset()
        assert not tracker.is_initialised

    def test_irregular_timestamps(self):
        """Filter handles irregular time intervals."""
        tracker = KalmanTracker()
        tracker.reset()
        tracker.step(_valid_estimate(0.0, 6.0, 4.0))
        tracker.step(_valid_estimate(0.1, 6.05, 4.0))
        tracker.step(_valid_estimate(0.5, 6.3, 4.0))
        result = tracker.step(_valid_estimate(2.0, 7.0, 4.0))
        assert result.status == EstimateStatus.VALID

    def test_large_gap_resets_filter(self):
        """A gap exceeding max_prediction_gap resets the filter."""
        cfg = KalmanConfig(max_prediction_gap=5.0)
        tracker = KalmanTracker(cfg)
        tracker.reset()
        tracker.step(_valid_estimate(0.0, 6.0, 4.0))
        # Jump 10 seconds ahead
        result = tracker.step(_valid_estimate(10.0, 8.0, 4.0))
        assert result.status == EstimateStatus.VALID
        assert "reset" in result.convergence_message.lower()

    def test_negative_dt_handled(self):
        """Negative dt is clamped to zero, not crashing."""
        tracker = KalmanTracker()
        tracker.reset()
        tracker.step(_valid_estimate(1.0, 6.0, 4.0))
        # Timestamp goes backwards
        result = tracker.step(_valid_estimate(0.5, 6.0, 4.0))
        assert result.status == EstimateStatus.VALID

    def test_prediction_only_produces_valid_status(self):
        """Prediction-only frames still report VALID status
        (the prediction itself is valid, just not measurement-updated)."""
        tracker = KalmanTracker()
        tracker.reset()
        tracker.step(_valid_estimate(0.0, 6.0, 4.0))
        result = tracker.step(_invalid_estimate(0.25))
        assert result.status == EstimateStatus.VALID
