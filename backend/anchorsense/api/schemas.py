"""
Pydantic schemas for the AnchorSense API.
"""

from __future__ import annotations

from typing import Any, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

from ..models import DEFAULT_TAG_Z


# ---------------------------------------------------------------------------
# Health & Configuration Schemas
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "0.1.0"
    engine: str = "AnchorSense Numerical Positioning Engine"


class RoomSchema(BaseModel):
    width: float = Field(12.0, gt=0, le=100.0, description="Room width in metres (x-axis)")
    length: float = Field(8.0, gt=0, le=100.0, description="Room length in metres (y-axis)")
    height: float = Field(3.5, gt=0, le=50.0, description="Room ceiling height in metres (z-axis)")


class AnchorSchema(BaseModel):
    id: str = Field(..., min_length=1, max_length=20, description="Unique anchor ID")
    x: float = Field(..., description="Anchor x coordinate (metres)")
    y: float = Field(..., description="Anchor y coordinate (metres)")
    z: float = Field(2.8, description="Anchor z height (metres)")
    is_active: bool = Field(True, description="Whether this anchor is currently operational")


class SimulationDefaultsSchema(BaseModel):
    num_points: int = 80
    sampling_interval: float = 0.25
    noise_std_dev: float = 0.15
    dropout_rate: float = 0.04
    outlier_rate: float = 0.02
    outlier_magnitude: float = 5.0
    nlos_bias_mean: float = 0.35
    nlos_rate: float = 0.10
    trajectory_type: str = "closed_loop"
    target_z: float = DEFAULT_TAG_Z
    seed: int = 42


class DefaultConfigResponse(BaseModel):
    room: RoomSchema
    anchors: list[AnchorSchema]
    nominal_tag_height: float
    simulation_defaults: SimulationDefaultsSchema


# ---------------------------------------------------------------------------
# Trajectory & Measurement Data Schemas
# ---------------------------------------------------------------------------

class TrajectoryPointSchema(BaseModel):
    id: int
    x: float
    y: float
    z: float
    timestamp: float


class RangeMeasurementSchema(BaseModel):
    anchor_id: str
    true_range: float
    measured_range: Optional[float] = None
    is_nlos: bool = False
    is_outlier: bool = False
    is_dropout: bool = False


class PositionEstimateSchema(BaseModel):
    timestamp: float
    x: Optional[float] = None
    y: Optional[float] = None
    status: str
    solver_cost: Optional[float] = None
    num_valid_measurements: int = 0
    convergence_message: str = ""
    is_kalman_updated: Optional[bool] = None


class MetricsSchema(BaseModel):
    mean_error_m: Optional[float] = None
    median_error_m: Optional[float] = None
    p95_error_m: Optional[float] = None
    rmse_m: Optional[float] = None
    valid_estimate_rate: float
    failure_rate: float
    valid_count: int
    failed_count: int
    total_count: int


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------

class BaseSimulationRequest(BaseModel):
    trajectory_type: Literal["closed_loop", "straight_line", "curved"] = "closed_loop"
    num_points: int = Field(80, ge=2, le=500, description="Trajectory sample count (2-500)")
    sampling_interval: float = Field(0.25, gt=0.01, le=5.0, description="Time step between observations (seconds)")
    noise_std_dev: float = Field(0.15, ge=0.0, le=5.0, description="Range measurement noise std dev (metres)")
    dropout_rate: float = Field(0.04, ge=0.0, lt=1.0, description="Measurement dropout probability [0, 1)")
    outlier_rate: float = Field(0.02, ge=0.0, lt=1.0, description="Gross outlier probability [0, 1)")
    outlier_magnitude: float = Field(5.0, ge=0.0, le=50.0, description="Maximum outlier magnitude (metres)")
    nlos_bias_mean: float = Field(0.35, ge=0.0, le=20.0, description="Mean exponential NLOS bias (metres)")
    nlos_rate: float = Field(0.10, ge=0.0, lt=1.0, description="NLOS contamination probability [0, 1)")
    target_z: float = Field(DEFAULT_TAG_Z, ge=0.0, le=10.0, description="Assumed device height (metres)")
    seed: Optional[int] = Field(42, description="Random seed for deterministic reproducibility")
    room: Optional[RoomSchema] = None
    anchors: Optional[list[AnchorSchema]] = None


class SimulationRunRequest(BaseSimulationRequest):
    solver: Literal["nls", "robust_nls", "nls_kalman", "robust_nls_kalman"] = "robust_nls"


class SimulationCompareRequest(BaseSimulationRequest):
    enable_kalman: bool = Field(True, description="Include Kalman filtered tracks in comparison")
    robust_loss: Literal["linear", "soft_l1", "huber", "cauchy", "arctan"] = "huber"
    robust_f_scale: float = Field(0.5, gt=0.01, le=10.0, description="Huber/soft-L1 soft margin scale")


# ---------------------------------------------------------------------------
# Response Schemas
# ---------------------------------------------------------------------------

class SimulationRunResponse(BaseModel):
    scenario_id: str
    algorithm_name: str
    trajectory_type: str
    num_points: int
    timestamps: list[float]
    ground_truth: list[TrajectoryPointSchema]
    measurements: list[list[RangeMeasurementSchema]]
    estimates: list[PositionEstimateSchema]
    metrics: MetricsSchema
    effective_config: dict[str, Any]


class SolverComparisonEntrySchema(BaseModel):
    name: str
    estimates: list[PositionEstimateSchema]
    metrics: MetricsSchema


class SimulationCompareResponse(BaseModel):
    scenario_id: str
    trajectory_type: str
    num_points: int
    timestamps: list[float]
    ground_truth: list[TrajectoryPointSchema]
    measurements: list[list[RangeMeasurementSchema]]
    solvers: dict[str, SolverComparisonEntrySchema]
    effective_config: dict[str, Any]
