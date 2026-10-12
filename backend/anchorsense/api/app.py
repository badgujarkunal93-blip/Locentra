"""
FastAPI application for AnchorSense AI positioning engine.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Sequence

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ..models import (
    Anchor,
    DEFAULT_ANCHORS,
    DEFAULT_TAG_Z,
    RoomGeometry,
    SimulationConfig,
    TrajectoryType,
)
from ..metrics import compute_metrics
from ..pipeline import run_pipeline
from ..simulator import generate_measurements, generate_trajectory
from ..solvers import solve_nls, solve_robust_nls
from ..tracking import KalmanConfig, KalmanTracker

from .schemas import (
    AnchorSchema,
    DefaultConfigResponse,
    HealthResponse,
    MetricsSchema,
    PositionEstimateSchema,
    RangeMeasurementSchema,
    RoomSchema,
    SimulationCompareRequest,
    SimulationCompareResponse,
    SimulationDefaultsSchema,
    SimulationRunRequest,
    SimulationRunResponse,
    SolverComparisonEntrySchema,
    TrajectoryPointSchema,
)

logger = logging.getLogger("anchorsense.api")


# ---------------------------------------------------------------------------
# App Factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AnchorSense Positioning Engine API",
    description="Numerical indoor positioning engine API providing synthetic range simulation, NLS solvers, and Kalman filtering.",
    version="0.1.0",
)

import os

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://locentra-olive.vercel.app",
]
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS")
configured_origins = (
    [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    if allowed_origins_env
    else []
)
# Union of configured origins and default local dev origins
origins = list(dict.fromkeys(DEFAULT_CORS_ORIGINS + configured_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Exception Handlers — Safe, No Traceback Leakage
# ---------------------------------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid parameter")
        errors.append(f"{field}: {msg}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request validation failed", "errors": errors},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Log internal error safely on the server side without exposing trace to client
    logger.error("Unhandled exception in API request: %s", str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred during positioning processing."},
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_config(req: Any) -> tuple[SimulationConfig, TrajectoryType]:
    # Resolve Room
    room = (
        RoomGeometry(width=req.room.width, length=req.room.length, height=req.room.height)
        if req.room
        else RoomGeometry()
    )

    # Resolve Anchors
    if req.anchors:
        anchors_list = [
            Anchor(id=a.id, x=a.x, y=a.y, z=a.z, is_active=a.is_active)
            for a in req.anchors
        ]
        active_count = sum(1 for a in anchors_list if a.is_active)
        if active_count < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"At least 3 active anchors are required for positioning fix, found {active_count}.",
            )
        anchors = tuple(anchors_list)
    else:
        anchors = DEFAULT_ANCHORS

    # Map trajectory type
    type_map = {
        "closed_loop": TrajectoryType.CLOSED_LOOP,
        "straight_line": TrajectoryType.STRAIGHT_LINE,
        "curved": TrajectoryType.CURVED,
    }
    ttype = type_map.get(req.trajectory_type, TrajectoryType.CLOSED_LOOP)

    cfg = SimulationConfig(
        room=room,
        anchors=anchors,
        num_points=req.num_points,
        sampling_interval=req.sampling_interval,
        noise_std_dev=req.noise_std_dev,
        dropout_rate=req.dropout_rate,
        outlier_rate=req.outlier_rate,
        outlier_magnitude=req.outlier_magnitude,
        nlos_bias_mean=req.nlos_bias_mean,
        nlos_rate=req.nlos_rate,
        target_z=req.target_z,
        seed=req.seed if req.seed is not None else 42,
    )
    return cfg, ttype


def _format_ground_truth(xs: Any, ys: Any, ts: Any, target_z: float) -> list[TrajectoryPointSchema]:
    return [
        TrajectoryPointSchema(
            id=i,
            x=round(float(xs[i]), 4),
            y=round(float(ys[i]), 4),
            z=round(float(target_z), 4),
            timestamp=round(float(ts[i]), 4),
        )
        for i in range(len(xs))
    ]


def _format_measurements(epochs: Any) -> list[list[RangeMeasurementSchema]]:
    formatted = []
    for ep in epochs:
        epoch_meas = [
            RangeMeasurementSchema(
                anchor_id=m.anchor_id,
                true_range=round(float(m.true_range), 4),
                measured_range=round(float(m.measured_range), 4) if m.measured_range is not None else None,
                is_nlos=bool(m.is_nlos),
                is_outlier=bool(m.is_outlier),
                is_dropout=bool(m.is_dropout),
            )
            for m in ep
        ]
        formatted.append(epoch_meas)
    return formatted


def _format_estimates(estimates: Any) -> list[PositionEstimateSchema]:
    return [
        PositionEstimateSchema(
            timestamp=round(float(e.timestamp), 4),
            x=round(float(e.x), 4) if e.x is not None else None,
            y=round(float(e.y), 4) if e.y is not None else None,
            status=e.status.value,
            solver_cost=round(float(e.solver_cost), 6) if e.solver_cost is not None else None,
            num_valid_measurements=e.num_valid_measurements,
            convergence_message=e.convergence_message,
            is_kalman_updated=e.is_kalman_updated,
        )
        for e in estimates
    ]


def _format_metrics(m: Any) -> MetricsSchema:
    return MetricsSchema(
        mean_error_m=round(float(m.mean_error_m), 4) if m.mean_error_m is not None else None,
        median_error_m=round(float(m.median_error_m), 4) if m.median_error_m is not None else None,
        p95_error_m=round(float(m.p95_error_m), 4) if m.p95_error_m is not None else None,
        rmse_m=round(float(m.rmse_m), 4) if m.rmse_m is not None else None,
        valid_estimate_rate=round(float(m.valid_estimate_rate), 4),
        failure_rate=round(float(m.failure_rate), 4),
        valid_count=m.valid_count,
        failed_count=m.failed_count,
        total_count=m.total_count,
    )


# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Return API health status, version, and engine identity."""
    return HealthResponse()


@app.get("/api/v1/config/default", response_model=DefaultConfigResponse)
def get_default_config() -> DefaultConfigResponse:
    """Return canonical room dimensions, 6 ceiling anchors, and default simulation parameters."""
    room = RoomGeometry()
    return DefaultConfigResponse(
        room=RoomSchema(width=room.width, length=room.length, height=room.height),
        anchors=[
            AnchorSchema(id=a.id, x=a.x, y=a.y, z=a.z, is_active=a.is_active)
            for a in DEFAULT_ANCHORS
        ],
        nominal_tag_height=DEFAULT_TAG_Z,
        simulation_defaults=SimulationDefaultsSchema(),
    )


@app.post("/api/v1/simulations/run", response_model=SimulationRunResponse)
def run_simulation(req: SimulationRunRequest) -> SimulationRunResponse:
    """Run an individual positioning simulation with the selected numerical solver."""
    cfg, ttype = _build_config(req)

    # 1. Generate ground-truth trajectory
    xs, ys, ts = generate_trajectory(cfg, ttype)

    # 2. Simulate corrupted observations
    measurements = generate_measurements(xs, ys, ts, cfg)

    # 3. Execute selected solver
    raw_estimates = []
    if req.solver in ("nls", "nls_kalman"):
        for i, epoch in enumerate(measurements):
            est = solve_nls(epoch, cfg.anchors, float(ts[i]), cfg.room, tag_z=cfg.target_z)
            raw_estimates.append(est)
    else:  # "robust_nls", "robust_nls_kalman"
        for i, epoch in enumerate(measurements):
            est = solve_robust_nls(epoch, cfg.anchors, float(ts[i]), cfg.room, tag_z=cfg.target_z)
            raw_estimates.append(est)

    # 4. Optional Kalman filter pass
    if req.solver in ("nls_kalman", "robust_nls_kalman"):
        tracker = KalmanTracker(KalmanConfig())
        tracker.reset()
        estimates = [tracker.step(e) for e in raw_estimates]
        algo_name = "NLS + Kalman" if req.solver == "nls_kalman" else "Robust NLS + Kalman"
    else:
        estimates = raw_estimates
        algo_name = "Ordinary NLS" if req.solver == "nls" else "Robust NLS (Huber)"

    metrics = compute_metrics(estimates, xs, ys)
    scenario_id = f"sim-{uuid.uuid4().hex[:8]}"

    effective_config = {
        "trajectory_type": ttype.value,
        "solver": req.solver,
        "num_points": cfg.num_points,
        "sampling_interval": cfg.sampling_interval,
        "noise_std_dev": cfg.noise_std_dev,
        "dropout_rate": cfg.dropout_rate,
        "outlier_rate": cfg.outlier_rate,
        "nlos_rate": cfg.nlos_rate,
        "target_z": cfg.target_z,
        "seed": cfg.seed,
    }

    return SimulationRunResponse(
        scenario_id=scenario_id,
        algorithm_name=algo_name,
        trajectory_type=ttype.value,
        num_points=cfg.num_points,
        timestamps=[round(float(t), 4) for t in ts],
        ground_truth=_format_ground_truth(xs, ys, ts, cfg.target_z),
        measurements=_format_measurements(measurements),
        estimates=_format_estimates(estimates),
        metrics=_format_metrics(metrics),
        effective_config=effective_config,
    )


@app.post("/api/v1/simulations/compare", response_model=SimulationCompareResponse)
def compare_simulations(req: SimulationCompareRequest) -> SimulationCompareResponse:
    """Compare Ordinary NLS, Robust NLS, and Kalman tracking side-by-side on the same measurements."""
    cfg, ttype = _build_config(req)

    pipeline_out = run_pipeline(
        config=cfg,
        trajectory_type=ttype,
        enable_kalman=req.enable_kalman,
        robust_loss=req.robust_loss,
        robust_f_scale=req.robust_f_scale,
    )

    solvers_map: dict[str, SolverComparisonEntrySchema] = {
        "nls": SolverComparisonEntrySchema(
            name=pipeline_out.nls.name,
            estimates=_format_estimates(pipeline_out.nls.estimates),
            metrics=_format_metrics(pipeline_out.nls.metrics),
        ),
        "robust_nls": SolverComparisonEntrySchema(
            name=pipeline_out.robust_nls.name,
            estimates=_format_estimates(pipeline_out.robust_nls.estimates),
            metrics=_format_metrics(pipeline_out.robust_nls.metrics),
        ),
    }

    if pipeline_out.nls_kalman:
        solvers_map["nls_kalman"] = SolverComparisonEntrySchema(
            name=pipeline_out.nls_kalman.name,
            estimates=_format_estimates(pipeline_out.nls_kalman.estimates),
            metrics=_format_metrics(pipeline_out.nls_kalman.metrics),
        )

    if pipeline_out.robust_nls_kalman:
        solvers_map["robust_nls_kalman"] = SolverComparisonEntrySchema(
            name=pipeline_out.robust_nls_kalman.name,
            estimates=_format_estimates(pipeline_out.robust_nls_kalman.estimates),
            metrics=_format_metrics(pipeline_out.robust_nls_kalman.metrics),
        )

    # Re-simulate measurements for JSON serialization response
    xs, ys, ts = (
        pipeline_out.gt_xs,
        pipeline_out.gt_ys,
        pipeline_out.timestamps,
    )
    measurements = generate_measurements(xs, ys, ts, cfg)
    scenario_id = f"cmp-{uuid.uuid4().hex[:8]}"

    effective_config = {
        "trajectory_type": ttype.value,
        "num_points": cfg.num_points,
        "sampling_interval": cfg.sampling_interval,
        "noise_std_dev": cfg.noise_std_dev,
        "dropout_rate": cfg.dropout_rate,
        "outlier_rate": cfg.outlier_rate,
        "nlos_rate": cfg.nlos_rate,
        "target_z": cfg.target_z,
        "robust_loss": req.robust_loss,
        "robust_f_scale": req.robust_f_scale,
        "enable_kalman": req.enable_kalman,
        "seed": cfg.seed,
    }

    return SimulationCompareResponse(
        scenario_id=scenario_id,
        trajectory_type=ttype.value,
        num_points=cfg.num_points,
        timestamps=[round(float(t), 4) for t in ts],
        ground_truth=[
            TrajectoryPointSchema(
                id=i,
                x=round(float(xs[i]), 4),
                y=round(float(ys[i]), 4),
                z=round(float(cfg.target_z), 4),
                timestamp=round(float(ts[i]), 4),
            )
            for i in range(len(xs))
        ],
        measurements=_format_measurements(measurements),
        solvers=solvers_map,
        effective_config=effective_config,
    )
