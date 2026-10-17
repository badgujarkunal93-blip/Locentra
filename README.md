# Locentra — Indoor Localisation Research & Simulation Platform

Locentra is an interactive indoor-positioning research and simulation platform designed to evaluate how numerical positioning algorithms perform when wireless distance measurements are noisy, missing, or distorted by obstacles.

Indoor positioning technologies such as Ultra-Wideband (UWB) and Bluetooth Low Energy (BLE) estimate coordinates from time-of-flight (ToF) or received signal strength (RSS). However, real-world indoor environments introduce multipath reflections, non-line-of-sight (NLOS) wall attenuation, packet dropouts, and geometric dilution of precision. Locentra provides a reproducible, controlled virtual laboratory to stress-test positioning solvers before deploying physical hardware.

---

## What Locentra Does

1. **Configures a Virtual Environment**: Sets up 2D and 3D indoor room dimensions, fixed reference anchors ($A_1 \dots A_6$), and ground-truth target trajectories (figure-eights, corridors, random walks).
2. **Simulates Unreliable Wireless Measurements**: Introduces controlled Gaussian measurement noise ($\sigma$), stochastic packet loss (dropout rate), obstacle-induced positive NLOS bias, and gross outlier spikes.
3. **Executes Numerical Solvers**: Calculates target position estimates using Ordinary Non-Linear Least Squares (NLS), Robust Huber M-estimation, and Kinematic Kalman motion filtering.
4. **Evaluates Benchmark Metrics**: Quantifies localisation error using Root Mean Squared Error (RMSE), Mean/Median error, 95th Percentile (P95) error, and valid-estimate success rates under identical seeds.

---

## Implemented Capabilities vs. Planned Research

| Component | Current Implementation Status | Notes |
| :--- | :--- | :--- |
| **Virtual Environment** | **Implemented** | Configurable 2D/3D room geometries, anchor layouts, and continuous target trajectories. |
| **Synthetic Measurement Simulator** | **Implemented** | Python engine modelling range noise, dropout, NLOS positive bias, and outliers. |
| **Nonlinear Least Squares (NLS)** | **Implemented** | Standard numerical optimization via SciPy Levenberg-Marquardt / Trust Region Reflective. |
| **Robust Huber M-Estimation** | **Implemented** | Downweights large measurement residuals ($\delta=1.345$) to resist severe outlier contamination. |
| **Kinematic Kalman Filtering** | **Implemented** | Constant-velocity state-space motion model filtering spatial jitter and bridging dropouts. |
| **Multi-Solver Benchmark API** | **Implemented** | FastAPI endpoint comparing all 4 solver configurations on identical synthetic observations. |
| **Interactive Frontend** | **Implemented** | Command Center, 2D/3D Spatial Lab, Scenario Studio, Benchmark Arena, and Dataset Explorer. |
| **Physical Sensor Feed** | *Planned Roadmap* | Real hardware transceivers (UWB / BLE serial or MQTT pipelines) planned for future phase. |
| **Trained ML Residual Model** | *Planned Roadmap* | Learned deep neural network residual correction model planned after physical dataset acquisition. |
| **Uncertainty Covariance Reporting**| *Planned Roadmap* | Formal covariance ellipse output under research verification. |

> [!NOTE]
> **Synthetic Data & Research Scope:** Locentra is a research prototype. All measurements currently visualised and computed are generated using mathematical simulation models. Positioning accuracy metrics must always be evaluated alongside valid-estimate rates. Under certain sparse or near-collinear anchor geometries, robust estimators can experience gradient flattening and perform worse than ordinary least squares—a known mathematical boundary documented in our research.

---

## Technical Architecture

```
┌────────────────────────────────────────────────────────┐
│             Locentra Frontend (React 19)               │
│  Command Center · Spatial Lab · Scenario · Benchmark   │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP REST (JSON)
                           ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Backend (anchorsense)              │
│  /api/v1/simulations/run · /api/v1/simulations/compare │
└─────────────┬────────────────────────────┬─────────────┘
              ▼                            ▼
┌───────────────────────────┐┌───────────────────────────┐
│   Measurement Simulator   ││    Positioning Solvers    │
│  • Gaussian Channel Noise ││  • Ordinary NLS           │
│  • Stochastic Dropout     ││  • Robust Huber NLS       │
│  • NLOS Positive Bias     ││  • Kinematic Kalman       │
│  • Outlier Injections     ││  • Combined Huber+Kalman  │
└───────────────────────────┘└───────────────────────────┘
```

---

## Backend REST API Endpoints

The backend is built with **FastAPI** and is located in `backend/anchorsense`:

- `GET /health`: Health status of the API engine and solver modules.
- `POST /api/v1/simulations/run`: Executes a single-solver simulation for a specified trajectory, anchor set, noise level, dropout rate, and NLOS configuration.
- `POST /api/v1/simulations/compare`: Runs an apples-to-apples comparison of all four solvers (`nls`, `robust_nls`, `nls_kalman`, `robust_nls_kalman`) across identical synthetic observations and returns comparative RMSE, P95, and valid-estimate statistics.

### Example Request (`POST /api/v1/simulations/run`)

```python
import requests

payload = {
    "scenario_id": "warehouse_combined_stress",
    "solver_type": "robust_nls_kalman",
    "noise_std_meters": 0.35,
    "dropout_rate": 0.15,
    "nlos_probability": 0.20,
    "nlos_bias_meters": 2.5,
    "seed": 42
}

response = requests.post("http://localhost:8000/api/v1/simulations/run", json=payload)
data = response.json()
print("RMSE:", data["metrics"]["rmse_meters"])
print("Valid Rate:", data["metrics"]["valid_estimate_rate"])
```

---

## Local Development & Setup

### Prerequisites
- **Node.js**: v18+ (tested on v22)
- **Python**: 3.10+ (tested with `uv` and standard `python3 -m venv`)

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Start Vite development server (http://localhost:5173)
npm run dev

# Run Vitest test suite (62 passing tests)
npm test -- --run

# Build production bundle
npm run build
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn anchorsense.api.app:app --reload --host 0.0.0.0 --port 8000

# Run Pytest suite (102 passing tests)
pytest tests/
```

---

## Project Roadmap

- [x] **Phase 1: Research Platform Core & Design System** (Completed)
- [x] **Phase 2: Interactive 2D/3D Spatial Environment & Synchronized Playback** (Completed)
- [x] **Phase 3: Python Positioning Engine & Synthetic Measurement Simulator** (Completed)
- [x] **Phase 4: Multi-Solver Comparative Benchmarking (NLS, Huber, Kalman)** (Completed)
- [x] **Phase 5: Transparent Research Audit & Clear Scientific Copy** (Completed)
- [ ] **Phase 6: Physical Transceiver Ingestion (BLE / UWB Serial & MQTT)** (Planned)
- [ ] **Phase 7: Machine Learning Deep Residual Correction on Real-World Data** (Planned)
- [ ] **Phase 8: Formal Covariance & Uncertainty Ellipse Computation** (Planned)

---

## License & Citation

Locentra is open-source research software developed for transparent evaluation of indoor positioning algorithms. Contributions and academic discussions are welcome via [GitHub Issues](https://github.com/badgujarkunal93-blip/Locentra/issues).
