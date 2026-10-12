# AnchorSense AI — Backend Numerical Engine & FastAPI Layer (Phases 3 & 4)

The numerical indoor positioning engine provides simulation, robust position estimation, Kalman tracking, and metrics benchmarking for range-based indoor localisation under sparse and corrupted range observations, exposed via a production-conscious FastAPI service.

---

## Architecture Overview

```
backend/
├── anchorsense/
│   ├── __init__.py           # Package export and versioning
│   ├── models.py             # Core dataclasses (RoomGeometry, Anchor, PositionEstimate, etc.)
│   ├── simulator.py          # Deterministic trajectory & corrupted range measurement generator
│   ├── solvers.py            # Ordinary NLS & Robust NLS (Huber / soft-L1) position solvers
│   ├── tracking.py           # Constant-velocity 2D Kalman filter with time-aware updates
│   ├── metrics.py            # Metrics engine (RMSE, MAE, Median/CEP50, P95, valid rate)
│   ├── pipeline.py           # End-to-end benchmark & evaluation pipeline
│   └── api/
│       ├── __init__.py       # API module init
│       ├── schemas.py        # Pydantic v2 request & response schemas
│       └── app.py            # FastAPI application, exception handlers, and endpoints
├── tests/
│   ├── test_canonical_geometry.py # Single-source-of-truth geometry & drift tests
│   ├── test_simulator.py          # Trajectory generation & range corruption tests
│   ├── test_solvers.py            # Ordinary & robust NLS solver tests
│   ├── test_tracking.py           # Kalman filter tests
│   ├── test_metrics.py            # Accuracy metrics & denominator tests
│   ├── test_pipeline.py           # End-to-end pipeline integration tests
│   └── test_api.py                # FastAPI endpoint integration & error safety tests
├── main.py                   # Uvicorn application entry point
├── requirements.txt
└── README.md
```

---

## Coordinate Conventions

- **Origin**: Room corner `(0, 0)`.
- **Dimensions**: Matches the frontend canonical room `12.0 m × 8.0 m × 3.5 m`.
- **Nominal Tag Height**: `1.1 m` (waist-level mobile device).
- **Units**: Coordinates in metres, timestamps in seconds.
- **Anchor layout**: Exact match to the 6 ceiling anchors configured in `useAppStore.ts`:
  - `A1`: `(0.5, 0.5, 2.8)`  — Northwest corner
  - `A2`: `(11.5, 0.5, 2.8)` — Northeast corner
  - `A3`: `(11.5, 7.5, 2.8)` — Southeast corner
  - `A4`: `(0.5, 7.5, 2.8)`  — Southwest corner
  - `A5`: `(6.0, 0.2, 3.2)`  — Mid-North perimeter
  - `A6`: `(6.0, 7.8, 3.2)`  — Mid-South perimeter

---

## Installation & Server Startup

```bash
cd backend
pip install -r requirements.txt

# Run the full test suite (99 tests)
python -m pytest -v

# Start the FastAPI server locally
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive OpenAPI Swagger UI is available at: `http://127.0.0.1:8000/docs`

---

## API Endpoints

### 1. Health Status
`GET /health`
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "engine": "AnchorSense Numerical Positioning Engine"
}
```

### 2. Canonical Environment Configuration
`GET /api/v1/config/default`
Returns canonical room geometry (`12m x 8m x 3.5m`), all 6 active ceiling anchors, nominal tag height (`1.1m`), and simulation default parameters.

### 3. Run Single Positioning Simulation
`POST /api/v1/simulations/run`

**Sample Request Body:**
```json
{
  "trajectory_type": "closed_loop",
  "num_points": 80,
  "sampling_interval": 0.25,
  "noise_std_dev": 0.15,
  "dropout_rate": 0.04,
  "outlier_rate": 0.02,
  "outlier_magnitude": 5.0,
  "nlos_bias_mean": 0.35,
  "nlos_rate": 0.10,
  "target_z": 1.1,
  "solver": "robust_nls",
  "seed": 42
}
```

**Sample Response Body (truncated):**
```json
{
  "scenario_id": "sim-a8f4c291",
  "algorithm_name": "Robust NLS (Huber)",
  "trajectory_type": "closed_loop",
  "num_points": 80,
  "timestamps": [0.0, 0.25, 0.5, ...],
  "ground_truth": [
    {"id": 0, "x": 6.0, "y": 4.0, "z": 1.1, "timestamp": 0.0},
    ...
  ],
  "measurements": [
    [
      {"anchor_id": "A1", "true_range": 6.723, "measured_range": 6.841, "is_nlos": false, "is_outlier": false, "is_dropout": false},
      ...
    ]
  ],
  "estimates": [
    {"timestamp": 0.0, "x": 6.023, "y": 3.985, "status": "valid", "solver_cost": 0.0124, "num_valid_measurements": 6}
  ],
  "metrics": {
    "mean_error_m": 0.1519,
    "median_error_m": 0.1342,
    "p95_error_m": 0.3421,
    "rmse_m": 0.1804,
    "valid_estimate_rate": 1.0,
    "failure_rate": 0.0,
    "valid_count": 80,
    "failed_count": 0,
    "total_count": 80
  },
  "effective_config": {
    "trajectory_type": "closed_loop",
    "solver": "robust_nls",
    "num_points": 80,
    "seed": 42
  }
}
```

### 4. Cross-Solver Comparison
`POST /api/v1/simulations/compare`

Runs Ordinary NLS, Robust NLS, and Kalman smoothing simultaneously over the same simulated measurements and returns side-by-side trajectory estimates and evaluation metrics.
