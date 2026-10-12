"""Tests for the synthetic trajectory and measurement simulator."""

import math

import numpy as np
import pytest

from anchorsense.models import (
    Anchor,
    RoomGeometry,
    SimulationConfig,
    TrajectoryType,
)
from anchorsense.simulator import (
    generate_measurements,
    generate_trajectory,
)


# ---------------------------------------------------------------------------
# Trajectory tests
# ---------------------------------------------------------------------------

class TestTrajectoryGeneration:
    """Tests for generate_trajectory."""

    def test_deterministic_with_same_seed(self):
        """Identical seeds and configs produce identical trajectories."""
        cfg = SimulationConfig(seed=99, num_points=50)
        xs1, ys1, ts1 = generate_trajectory(cfg, TrajectoryType.CLOSED_LOOP)
        xs2, ys2, ts2 = generate_trajectory(cfg, TrajectoryType.CLOSED_LOOP)
        np.testing.assert_array_equal(xs1, xs2)
        np.testing.assert_array_equal(ys1, ys2)
        np.testing.assert_array_equal(ts1, ts2)

    def test_different_seeds_differ(self):
        """Different seeds may still produce the same trajectory for
        deterministic shapes (closed_loop is parameterised, not random),
        but the output length should match."""
        cfg = SimulationConfig(seed=1, num_points=40)
        xs, ys, ts = generate_trajectory(cfg, TrajectoryType.CLOSED_LOOP)
        assert len(xs) == 40
        assert len(ys) == 40
        assert len(ts) == 40

    @pytest.mark.parametrize("ttype", list(TrajectoryType))
    def test_bounded_within_room(self, ttype):
        """All trajectory points stay within room boundaries."""
        cfg = SimulationConfig(num_points=100)
        xs, ys, _ = generate_trajectory(cfg, ttype)
        assert np.all(xs >= 0) and np.all(xs <= cfg.room.width)
        assert np.all(ys >= 0) and np.all(ys <= cfg.room.length)

    @pytest.mark.parametrize("ttype", list(TrajectoryType))
    def test_correct_length(self, ttype):
        """Output arrays have the requested number of points."""
        cfg = SimulationConfig(num_points=60)
        xs, ys, ts = generate_trajectory(cfg, ttype)
        assert len(xs) == 60
        assert len(ys) == 60
        assert len(ts) == 60

    def test_timestamps_monotonic(self):
        """Timestamps are monotonically increasing."""
        cfg = SimulationConfig(num_points=80, sampling_interval=0.25)
        _, _, ts = generate_trajectory(cfg, TrajectoryType.CLOSED_LOOP)
        assert np.all(np.diff(ts) > 0)

    def test_invalid_trajectory_type_raises(self):
        cfg = SimulationConfig()
        with pytest.raises(ValueError):
            generate_trajectory(cfg, "nonexistent")

    def test_invalid_num_points_raises(self):
        with pytest.raises(ValueError):
            SimulationConfig(num_points=1)

    def test_invalid_sampling_interval_raises(self):
        with pytest.raises(ValueError):
            SimulationConfig(sampling_interval=-0.1)


# ---------------------------------------------------------------------------
# Measurement tests
# ---------------------------------------------------------------------------

class TestMeasurementGeneration:
    """Tests for generate_measurements."""

    def test_deterministic_measurements(self):
        """Same seed + config => identical measurements."""
        cfg = SimulationConfig(seed=42, num_points=20)
        xs, ys, ts = generate_trajectory(cfg)
        m1 = generate_measurements(xs, ys, ts, cfg)
        m2 = generate_measurements(xs, ys, ts, cfg)
        for epoch1, epoch2 in zip(m1, m2):
            for a, b in zip(epoch1, epoch2):
                assert a.anchor_id == b.anchor_id
                assert a.measured_range == b.measured_range
                assert a.is_dropout == b.is_dropout

    def test_true_range_matches_euclidean(self):
        """True ranges agree with Euclidean geometry."""
        cfg = SimulationConfig(
            num_points=5,
            noise_std_dev=0,
            dropout_rate=0,
            outlier_rate=0,
            nlos_rate=0,
        )
        xs, ys, ts = generate_trajectory(cfg, TrajectoryType.STRAIGHT_LINE)
        measurements = generate_measurements(xs, ys, ts, cfg)

        for i, epoch in enumerate(measurements):
            for m in epoch:
                anchor = next(a for a in cfg.anchors if a.id == m.anchor_id)
                expected = math.sqrt(
                    (xs[i] - anchor.x) ** 2 +
                    (ys[i] - anchor.y) ** 2 +
                    (cfg.target_z - anchor.z) ** 2
                )
                assert abs(m.true_range - expected) < 1e-10

    def test_noise_free_measured_equals_true(self):
        """With zero noise/dropout/outlier/nlos, measured == true."""
        cfg = SimulationConfig(
            num_points=10,
            noise_std_dev=0,
            dropout_rate=0,
            outlier_rate=0,
            nlos_rate=0,
        )
        xs, ys, ts = generate_trajectory(cfg)
        measurements = generate_measurements(xs, ys, ts, cfg)
        for epoch in measurements:
            for m in epoch:
                assert m.measured_range is not None
                assert abs(m.measured_range - m.true_range) < 1e-10

    def test_dropout_creates_none_not_zero(self):
        """Dropout produces None, never zero."""
        cfg = SimulationConfig(
            num_points=200,
            dropout_rate=0.5,
            noise_std_dev=0,
            outlier_rate=0,
            nlos_rate=0,
            seed=123,
        )
        xs, ys, ts = generate_trajectory(cfg)
        measurements = generate_measurements(xs, ys, ts, cfg)

        has_dropout = False
        for epoch in measurements:
            for m in epoch:
                if m.is_dropout:
                    assert m.measured_range is None, "Dropout must be None, not zero"
                    has_dropout = True
        assert has_dropout, "Expected at least one dropout with rate=0.5"

    def test_noise_applied(self):
        """With noise enabled, measured ranges differ from true ranges."""
        cfg = SimulationConfig(
            num_points=50,
            noise_std_dev=0.5,
            dropout_rate=0,
            outlier_rate=0,
            nlos_rate=0,
            seed=7,
        )
        xs, ys, ts = generate_trajectory(cfg)
        measurements = generate_measurements(xs, ys, ts, cfg)

        diffs = []
        for epoch in measurements:
            for m in epoch:
                if m.measured_range is not None:
                    diffs.append(abs(m.measured_range - m.true_range))
        assert max(diffs) > 0.01, "Noise should produce measurable differences"

    def test_nlos_bias_is_positive(self):
        """NLOS bias is always positive (adds to the range)."""
        cfg = SimulationConfig(
            num_points=200,
            noise_std_dev=0,
            dropout_rate=0,
            outlier_rate=0,
            nlos_rate=0.9,
            nlos_bias_mean=1.0,
            seed=55,
        )
        xs, ys, ts = generate_trajectory(cfg)
        measurements = generate_measurements(xs, ys, ts, cfg)

        nlos_count = 0
        for epoch in measurements:
            for m in epoch:
                if m.is_nlos and m.measured_range is not None:
                    assert m.measured_range >= m.true_range - 1e-10
                    nlos_count += 1
        assert nlos_count > 0

    def test_inactive_anchor_always_dropped(self):
        """Inactive anchors always produce dropout."""
        anchors = list(SimulationConfig().anchors)
        # Make A1 inactive
        anchors[0] = Anchor(id="A1", x=0.5, y=0.5, z=2.8, is_active=False)
        cfg = SimulationConfig(
            anchors=tuple(anchors),
            num_points=20,
            dropout_rate=0,
        )
        xs, ys, ts = generate_trajectory(cfg)
        measurements = generate_measurements(xs, ys, ts, cfg)
        for epoch in measurements:
            a1_meas = [m for m in epoch if m.anchor_id == "A1"]
            assert len(a1_meas) == 1
            assert a1_meas[0].measured_range is None
            assert a1_meas[0].is_dropout is True

    def test_invalid_noise_std_raises(self):
        with pytest.raises(ValueError):
            SimulationConfig(noise_std_dev=-0.1)

    def test_invalid_dropout_rate_raises(self):
        with pytest.raises(ValueError):
            SimulationConfig(dropout_rate=1.0)

    def test_invalid_outlier_magnitude_raises(self):
        with pytest.raises(ValueError, match="outlier_magnitude"):
            SimulationConfig(outlier_magnitude=-1.0)

    def test_invalid_nlos_bias_mean_raises(self):
        with pytest.raises(ValueError, match="nlos_bias_mean"):
            SimulationConfig(nlos_bias_mean=-0.5)

    def test_invalid_room_dimensions_raises(self):
        with pytest.raises(ValueError, match="Room dimensions must be positive"):
            RoomGeometry(width=-12.0)
        with pytest.raises(ValueError, match="Room dimensions must be positive"):
            RoomGeometry(length=0.0)
        with pytest.raises(ValueError, match="Room dimensions must be positive"):
            RoomGeometry(height=-3.5)

