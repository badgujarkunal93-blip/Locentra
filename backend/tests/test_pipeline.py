"""Tests for the complete offline positioning pipeline."""

import math
import numpy as np
import pytest

from anchorsense.models import (
    EstimateStatus,
    SimulationConfig,
    TrajectoryType,
)
from anchorsense.pipeline import run_pipeline


class TestPipeline:
    """End-to-end pipeline tests."""

    def test_reproducible_with_fixed_seed(self):
        """Same seed produces identical pipeline outputs."""
        cfg = SimulationConfig(seed=42, num_points=30)
        out1 = run_pipeline(cfg, enable_kalman=True)
        out2 = run_pipeline(cfg, enable_kalman=True)

        assert out1.gt_xs == out2.gt_xs
        assert out1.gt_ys == out2.gt_ys
        assert out1.nls.metrics.mean_error_m == out2.nls.metrics.mean_error_m
        assert out1.robust_nls.metrics.mean_error_m == out2.robust_nls.metrics.mean_error_m

        # Kalman results should also be identical
        assert out1.nls_kalman is not None
        assert out2.nls_kalman is not None
        assert (
            out1.nls_kalman.metrics.mean_error_m ==
            out2.nls_kalman.metrics.mean_error_m
        )

    def test_different_seeds_differ(self):
        """Different seeds produce different measurement corruptions
        and thus different metrics."""
        cfg1 = SimulationConfig(seed=1, num_points=30)
        cfg2 = SimulationConfig(seed=999, num_points=30)
        out1 = run_pipeline(cfg1, enable_kalman=False)
        out2 = run_pipeline(cfg2, enable_kalman=False)
        # With different noise realisations, metrics should differ
        # (GT trajectories are the same since they're deterministic)
        assert out1.nls.metrics.mean_error_m != out2.nls.metrics.mean_error_m

    def test_pipeline_output_structure(self):
        """Pipeline returns all expected fields."""
        out = run_pipeline(enable_kalman=True)
        assert out.num_points == 80
        assert len(out.gt_xs) == 80
        assert len(out.gt_ys) == 80
        assert len(out.timestamps) == 80
        assert len(out.nls.estimates) == 80
        assert len(out.robust_nls.estimates) == 80
        assert out.nls_kalman is not None
        assert len(out.nls_kalman.estimates) == 80

    def test_solvers_receive_no_ground_truth(self):
        """Verify that solver estimates don't suspiciously match GT exactly.
        If they did, it would suggest GT was leaked to the solver."""
        cfg = SimulationConfig(
            seed=42, num_points=20,
            noise_std_dev=0.3, nlos_rate=0.15,
        )
        out = run_pipeline(cfg, enable_kalman=False)
        perfect_count = 0
        for i, est in enumerate(out.nls.estimates):
            if est.status == EstimateStatus.VALID:
                err = math.sqrt(
                    (est.x - out.gt_xs[i])**2 + (est.y - out.gt_ys[i])**2
                )
                if err < 1e-6:
                    perfect_count += 1
        # With noise_std=0.3 and nlos, essentially no estimate should
        # exactly match GT
        assert perfect_count == 0, "Estimates suspiciously match ground truth"

    def test_valid_rate_is_high_under_low_noise(self):
        """Under low noise with 6 anchors, most estimates should be valid."""
        cfg = SimulationConfig(
            seed=42, num_points=50,
            noise_std_dev=0.05,
            dropout_rate=0.01,
            outlier_rate=0.0,
            nlos_rate=0.0,
        )
        out = run_pipeline(cfg, enable_kalman=False)
        assert out.nls.metrics.valid_estimate_rate > 0.9

    def test_metrics_total_count_matches_num_points(self):
        """Metrics total_count equals the trajectory length."""
        cfg = SimulationConfig(num_points=40)
        out = run_pipeline(cfg, enable_kalman=False)
        assert out.nls.metrics.total_count == 40
        assert out.robust_nls.metrics.total_count == 40
        assert (
            out.nls.metrics.valid_count + out.nls.metrics.failed_count == 40
        )

    @pytest.mark.parametrize("ttype", list(TrajectoryType))
    def test_all_trajectory_types(self, ttype):
        """Pipeline runs without error for all trajectory types."""
        cfg = SimulationConfig(num_points=20, seed=7)
        out = run_pipeline(cfg, trajectory_type=ttype, enable_kalman=True)
        assert len(out.nls.estimates) == 20
        assert out.nls_kalman is not None

    def test_kalman_disabled(self):
        """Pipeline works with Kalman disabled."""
        out = run_pipeline(enable_kalman=False)
        assert out.nls_kalman is None
        assert out.robust_nls_kalman is None

    def test_high_dropout_handled(self):
        """Pipeline handles high dropout without crashing."""
        cfg = SimulationConfig(
            num_points=30, seed=42,
            dropout_rate=0.7,
        )
        out = run_pipeline(cfg, enable_kalman=True)
        # Many failures expected, but pipeline should not crash
        assert out.nls.metrics.total_count == 30
