"""
Complete offline positioning pipeline.

Orchestrates:
  1. Synthetic trajectory generation
  2. Range measurement simulation
  3. Ordinary NLS position estimation
  4. Robust NLS position estimation
  5. Optional Kalman tracking on each solver's output
  6. Accuracy evaluation against held-back ground truth

Ground truth is used ONLY for:
  - Generating the trajectory (simulator)
  - Calculating evaluation metrics AFTER estimation

Ground truth is NEVER passed to the solvers or the Kalman filter.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from .metrics import compute_metrics
from .models import (
    EstimateStatus,
    PipelineMetrics,
    PositionEstimate,
    SimulationConfig,
    TrajectoryType,
)
from .simulator import generate_measurements, generate_trajectory
from .solvers import solve_nls, solve_robust_nls
from .tracking import KalmanConfig, KalmanTracker


# ---------------------------------------------------------------------------
# Pipeline output
# ---------------------------------------------------------------------------

@dataclass
class SolverResult:
    """Per-solver output container."""
    name: str
    estimates: list[PositionEstimate]
    metrics: PipelineMetrics


@dataclass
class PipelineOutput:
    """Complete pipeline result."""
    config: SimulationConfig
    trajectory_type: str
    num_points: int
    # Ground truth (held for evaluation only)
    gt_xs: list[float]
    gt_ys: list[float]
    timestamps: list[float]
    # Solver results
    nls: SolverResult
    robust_nls: SolverResult
    nls_kalman: Optional[SolverResult] = None
    robust_nls_kalman: Optional[SolverResult] = None


# ---------------------------------------------------------------------------
# Pipeline runner
# ---------------------------------------------------------------------------

def run_pipeline(
    config: Optional[SimulationConfig] = None,
    trajectory_type: TrajectoryType = TrajectoryType.CLOSED_LOOP,
    enable_kalman: bool = True,
    kalman_config: Optional[KalmanConfig] = None,
    robust_loss: str = "huber",
    robust_f_scale: float = 0.5,
) -> PipelineOutput:
    """
    Execute the complete offline positioning pipeline.

    Parameters
    ----------
    config : SimulationConfig
        Simulation parameters (room, anchors, noise, seed, etc.).
        Uses defaults matching the frontend if not provided.
    trajectory_type : TrajectoryType
        Which trajectory shape to generate.
    enable_kalman : bool
        Whether to also produce Kalman-tracked estimates.
    kalman_config : KalmanConfig
        Kalman filter tuning parameters.
    robust_loss : str
        Robust loss function name for the robust NLS solver.
    robust_f_scale : float
        Soft margin scale for the robust loss.

    Returns
    -------
    PipelineOutput with all solver results and metrics.
    """
    if config is None:
        config = SimulationConfig()

    # 1. Generate ground-truth trajectory
    gt_xs, gt_ys, timestamps = generate_trajectory(config, trajectory_type)

    # 2. Generate corrupted range measurements
    all_measurements = generate_measurements(gt_xs, gt_ys, timestamps, config)

    # 3. Run ordinary NLS
    nls_estimates: list[PositionEstimate] = []
    for i, epoch_meas in enumerate(all_measurements):
        est = solve_nls(
            measurements=epoch_meas,
            anchors=config.anchors,
            timestamp=float(timestamps[i]),
            room=config.room,
        )
        nls_estimates.append(est)

    nls_metrics = compute_metrics(nls_estimates, gt_xs, gt_ys)
    nls_result = SolverResult(name="NLS (ordinary)", estimates=nls_estimates, metrics=nls_metrics)

    # 4. Run robust NLS
    robust_estimates: list[PositionEstimate] = []
    for i, epoch_meas in enumerate(all_measurements):
        est = solve_robust_nls(
            measurements=epoch_meas,
            anchors=config.anchors,
            timestamp=float(timestamps[i]),
            room=config.room,
            loss=robust_loss,
            f_scale=robust_f_scale,
        )
        robust_estimates.append(est)

    robust_metrics = compute_metrics(robust_estimates, gt_xs, gt_ys)
    robust_result = SolverResult(name="NLS (robust/Huber)", estimates=robust_estimates, metrics=robust_metrics)

    # 5. Kalman tracking (optional)
    nls_kalman_result: Optional[SolverResult] = None
    robust_kalman_result: Optional[SolverResult] = None

    if enable_kalman:
        kc = kalman_config or KalmanConfig()

        # Kalman on NLS
        tracker = KalmanTracker(kc)
        tracker.reset()
        nls_tracked: list[PositionEstimate] = []
        for est in nls_estimates:
            tracked = tracker.step(est)
            nls_tracked.append(tracked)
        nls_kalman_metrics = compute_metrics(nls_tracked, gt_xs, gt_ys)
        nls_kalman_result = SolverResult(
            name="NLS + Kalman", estimates=nls_tracked, metrics=nls_kalman_metrics,
        )

        # Kalman on robust NLS
        tracker2 = KalmanTracker(kc)
        tracker2.reset()
        robust_tracked: list[PositionEstimate] = []
        for est in robust_estimates:
            tracked = tracker2.step(est)
            robust_tracked.append(tracked)
        robust_kalman_metrics = compute_metrics(robust_tracked, gt_xs, gt_ys)
        robust_kalman_result = SolverResult(
            name="Robust NLS + Kalman", estimates=robust_tracked, metrics=robust_kalman_metrics,
        )

    return PipelineOutput(
        config=config,
        trajectory_type=trajectory_type.value,
        num_points=config.num_points,
        gt_xs=gt_xs.tolist(),
        gt_ys=gt_ys.tolist(),
        timestamps=timestamps.tolist(),
        nls=nls_result,
        robust_nls=robust_result,
        nls_kalman=nls_kalman_result,
        robust_nls_kalman=robust_kalman_result,
    )


# ---------------------------------------------------------------------------
# CLI entry point (convenience)
# ---------------------------------------------------------------------------

def main() -> None:
    """Quick demo — run with `python -m anchorsense.pipeline`."""
    output = run_pipeline()
    solvers = [output.nls, output.robust_nls]
    if output.nls_kalman:
        solvers.append(output.nls_kalman)
    if output.robust_nls_kalman:
        solvers.append(output.robust_nls_kalman)

    print(f"Pipeline: {output.num_points} points, trajectory={output.trajectory_type}")
    print(f"Seed: {output.config.seed}")
    print()
    for s in solvers:
        m = s.metrics
        print(f"--- {s.name} ---")
        print(f"  Valid rate:   {m.valid_estimate_rate:.1%} ({m.valid_count}/{m.total_count})")
        if m.mean_error_m is not None:
            print(f"  Mean error:   {m.mean_error_m:.4f} m")
            print(f"  Median error: {m.median_error_m:.4f} m")
            print(f"  95th %ile:    {m.p95_error_m:.4f} m")
            print(f"  RMSE:         {m.rmse_m:.4f} m")
        else:
            print("  (no valid estimates)")
        print()


if __name__ == "__main__":
    main()
