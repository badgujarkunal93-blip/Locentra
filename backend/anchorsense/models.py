"""
Data models for the AnchorSense positioning engine.

All spatial quantities are in metres. Timestamps are in seconds.
Coordinate convention matches the frontend: origin at room corner (0,0),
x-axis along the room width (12 m), y-axis along the room length (8 m).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

import numpy as np


# ---------------------------------------------------------------------------
# Canonical environment matching the frontend Zustand store
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Anchor:
    """A fixed reference transceiver at a known position."""
    id: str
    x: float  # metres
    y: float  # metres
    z: float = 2.8  # metres (ceiling height, used for 3D range)
    is_active: bool = True


@dataclass(frozen=True)
class RoomGeometry:
    """Rectangular room boundaries."""
    width: float = 12.0   # metres (x-axis span)
    length: float = 8.0   # metres (y-axis span)
    height: float = 3.5   # metres

    def __post_init__(self) -> None:
        if self.width <= 0 or self.length <= 0 or self.height <= 0:
            raise ValueError("Room dimensions must be positive")


# Default tag height matching frontend trajectory generation (1.1m nominal waist level)
DEFAULT_TAG_Z: float = 1.1

# Default anchor layout — coordinates taken directly from the frontend store.
DEFAULT_ANCHORS: tuple[Anchor, ...] = (
    Anchor(id="A1", x=0.5,  y=0.5,  z=2.8),
    Anchor(id="A2", x=11.5, y=0.5,  z=2.8),
    Anchor(id="A3", x=11.5, y=7.5,  z=2.8),
    Anchor(id="A4", x=0.5,  y=7.5,  z=2.8),
    Anchor(id="A5", x=6.0,  y=0.2,  z=3.2),
    Anchor(id="A6", x=6.0,  y=7.8,  z=3.2),
)


# ---------------------------------------------------------------------------
# Simulation configuration
# ---------------------------------------------------------------------------

@dataclass
class SimulationConfig:
    """Parameters for synthetic trajectory and measurement generation."""
    room: RoomGeometry = field(default_factory=RoomGeometry)
    anchors: tuple[Anchor, ...] = DEFAULT_ANCHORS
    num_points: int = 80
    sampling_interval: float = 0.25  # seconds (4 Hz, matching frontend)
    noise_std_dev: float = 0.15      # metres  Gaussian σ
    dropout_rate: float = 0.04       # probability of missing a measurement
    outlier_rate: float = 0.02       # probability of large outlier
    outlier_magnitude: float = 5.0   # metres  max additional positive outlier
    nlos_bias_mean: float = 0.35     # metres  mean of exponential NLOS bias
    nlos_rate: float = 0.10          # probability of NLOS-biased measurement
    target_z: float = DEFAULT_TAG_Z  # metres  mobile tag height
    seed: int = 42

    def __post_init__(self) -> None:
        if self.num_points < 2:
            raise ValueError("num_points must be >= 2")
        if self.sampling_interval <= 0:
            raise ValueError("sampling_interval must be positive")
        if self.noise_std_dev < 0:
            raise ValueError("noise_std_dev must be non-negative")
        if not 0 <= self.dropout_rate < 1:
            raise ValueError("dropout_rate must be in [0, 1)")
        if not 0 <= self.outlier_rate < 1:
            raise ValueError("outlier_rate must be in [0, 1)")
        if not 0 <= self.nlos_rate < 1:
            raise ValueError("nlos_rate must be in [0, 1)")
        if self.outlier_magnitude < 0:
            raise ValueError("outlier_magnitude must be non-negative")
        if self.nlos_bias_mean < 0:
            raise ValueError("nlos_bias_mean must be non-negative")
        if self.target_z < 0:
            raise ValueError("target_z must be non-negative")


# ---------------------------------------------------------------------------
# Trajectory type selector
# ---------------------------------------------------------------------------

class TrajectoryType(Enum):
    CLOSED_LOOP = "closed_loop"     # Lemniscate / figure-8
    STRAIGHT_LINE = "straight_line"
    CURVED = "curved"               # Sinusoidal variable-direction path


# ---------------------------------------------------------------------------
# Measurement record — one anchor observation at one timestamp
# ---------------------------------------------------------------------------

@dataclass
class RangeMeasurement:
    """A single range observation from one anchor at one timestamp."""
    anchor_id: str
    true_range: float           # metres — ground truth (evaluation only)
    measured_range: Optional[float]  # metres, None when dropped
    is_nlos: bool = False
    is_outlier: bool = False
    is_dropout: bool = False


# ---------------------------------------------------------------------------
# Estimation result status
# ---------------------------------------------------------------------------

class EstimateStatus(Enum):
    VALID = "valid"
    INSUFFICIENT_MEASUREMENTS = "insufficient_measurements"
    POOR_GEOMETRY = "poor_geometry"
    SOLVER_FAILED = "solver_failed"
    INVALID_INPUT = "invalid_input"


# ---------------------------------------------------------------------------
# Per-timestamp estimation result
# ---------------------------------------------------------------------------

@dataclass
class PositionEstimate:
    """Result of a single-epoch position estimate."""
    timestamp: float
    x: Optional[float] = None
    y: Optional[float] = None
    status: EstimateStatus = EstimateStatus.VALID
    solver_cost: Optional[float] = None
    num_valid_measurements: int = 0
    residuals: Optional[np.ndarray] = None  # per-anchor residuals
    convergence_message: str = ""
    is_kalman_updated: Optional[bool] = None  # None if Kalman not used


# ---------------------------------------------------------------------------
# Aggregate metrics
# ---------------------------------------------------------------------------

@dataclass
class PipelineMetrics:
    """Summary accuracy metrics over a trajectory."""
    mean_error_m: Optional[float] = None
    median_error_m: Optional[float] = None
    p95_error_m: Optional[float] = None
    rmse_m: Optional[float] = None
    valid_estimate_rate: float = 0.0   # valid / total eligible
    failure_rate: float = 0.0          # 1 - valid_estimate_rate
    valid_count: int = 0
    failed_count: int = 0
    total_count: int = 0
