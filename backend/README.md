# AnchorSense AI — Backend Numerical Engine (Phase 3)

The numerical indoor positioning engine provides simulation, robust position estimation, Kalman tracking, and metrics benchmarking for range-based indoor localisation under sparse and corrupted range observations.

---

## Architecture Overview

```
backend/
├── anchorsense/
│   ├── __init__.py      # Package export and versioning
│   ├── models.py        # Core dataclasses (RoomGeometry, Anchor, PositionEstimate, etc.)
│   ├── simulator.py     # Deterministic trajectory & corrupted range measurement generator
│   ├── solvers.py       # Ordinary NLS & Robust NLS (Huber / soft-L1) position solvers
│   ├── tracking.py      # Constant-velocity 2D Kalman filter with time-aware updates
│   ├── metrics.py       # Metrics engine (RMSE, MAE, Median/CEP50, P95, valid rate)
│   └── pipeline.py      # End-to-end benchmark & evaluation pipeline
├── tests/
│   ├── test_models.py
│   ├── test_simulator.py
│   ├── test_solvers.py
│   ├── test_tracking.py
│   ├── test_metrics.py
│   └── test_pipeline.py
├── requirements.txt
└── README.md
```

---

## Coordinate Conventions

- **Origin**: Room corner `(0, 0)`.
- **Dimensions**: Matches the frontend default `12.0 m × 12.0 m`.
- **Units**: Coordinates in metres, timestamps in seconds.
- **Anchor layout**: Exact match to the 4 ceiling anchors configured in `useAppStore.ts`:
  - `A1`: `(1.0, 1.0, 3.0)`
  - `A2`: `(11.0, 1.0, 3.0)`
  - `A3`: `(11.0, 11.0, 3.0)`
  - `A4`: `(1.0, 11.0, 3.0)`

---

## Installation & Testing

```bash
cd backend
pip install -r requirements.txt
python -m pytest -v
```

All 69 unit and integration tests validate:
- Trajectory determinism, bounds, and Euclidean measurement geometry
- Noise, NLOS positive bias, outliers, and dropout representation (`None`)
- Solver behaviour under noise-free, noisy, collinear, and outlier conditions
- Strict isolation ensuring ground truth is never exposed to position solvers
- Time-aware Kalman prediction, update, and gap recovery
- Denominator consistency in error and valid-estimate statistics
