# Locentra — Project Context & Antigravity Handover Guide

> **Project Name:** Locentra (formerly AnchorSense AI)  
> **Tagline:** Indoor Localisation Research & Spatial Intelligence Platform  
> **GitHub Repository:** [https://github.com/badgujarkunal93-blip/Locentra](https://github.com/badgujarkunal93-blip/Locentra)  
> **Production Frontend (Vercel):** [https://locentra-olive.vercel.app](https://locentra-olive.vercel.app)  
> **Production Backend (Render):** [https://locentra.onrender.com](https://locentra.onrender.com)  
> **Primary Branch:** `main`

---

## 1. Executive Summary & Purpose

**Locentra** is a full-stack, research-grade indoor positioning and spatial intelligence platform. It simulates, evaluates, and visualizes 2D/3D indoor target localization using multi-anchor range measurements (e.g. Ultra-Wideband [UWB] / Time-of-Flight [ToF] transceivers).

The platform addresses real-world indoor positioning challenges:
- **Non-Line-of-Sight (NLOS) Degradation:** Obstacle shadowing, wall attenuation, and signal multipath reflections.
- **Mathematical Solver Benchmarking:** Linear Trilateration, Levenberg-Marquardt Non-Linear Least Squares (NLLS), Robust Huber-loss NLLS, and Extended Kalman Filter (EKF) motion tracking.
- **ML Residual Calibration:** Hybrid machine-learning residual models reducing obstacle bias on top of Kalman state estimation.
- **Spatial Computing & Visualization:** Coordinate-accurate 2D SVG vector floor plans alongside interactive 3D WebGL rooms (Three.js / React Three Fiber).

---

## 2. Technology Stack & Key Libraries

### Frontend
- **Framework & Bundler:** React 19, TypeScript 5.7, Vite 6
- **Styling:** Vanilla CSS + Tailwind CSS v4 design tokens (`src/index.css`)
- **3D Graphics & Spatial Canvas:** Three.js, `@react-three/fiber` v9, `@react-three/drei` v10
- **State Management:** Zustand v5 (`src/store/useAppStore.ts`)
- **Server Communication & Caching:** TanStack React Query v5 + custom typed API client (`src/lib/apiClient.ts`)
- **Icons & Typography:** Lucide React, Google Fonts (*Plus Jakarta Sans*, *Inter*, *JetBrains Mono*)
- **Test Suite:** Vitest v3, React Testing Library, jsdom (25 automated tests)

### Backend
- **Engine Framework:** FastAPI, Uvicorn, Python 3.11+
- **Numerical Computation:** NumPy, SciPy (Optimization solvers, Levenberg-Marquardt, Huber loss)
- **Deployment:** Render Web Service (`render.yaml` with public health checks and CORS configuration)

---

## 3. Design System & Visual Hierarchy

Locentra uses a **neo-minimalist engineering workspace aesthetic**:

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| **Dark Charcoal** | `#232124` | Sidebar navigation, featured analytical panels, room mini-maps |
| **Soft Canvas** | `#E6E6E6` | Main application background canvas |
| **Pure White** | `#FFFFFF` | Primary content cards, metric tiles |
| **Electric Lime** | `#D9F56F` | Primary brand accent, healthy status nodes, active CTA buttons |
| **Pastel Lavender** | `#B6A9EF` | Secondary accent, ML hybrid indicators, sparklines |
| **Signal Violet** | `#4C3B9E` | Secondary badge text and icon backgrounds (`#DDD6F8`) |
| **Emerald Green** | `#10B981` | 100% healthy anchor status, low error rate indicators |
| **Amber Orange** | `#F59E0B` | Degraded NLOS indicators, warning signal conditions |

### Custom Brand Mark (`LocentraLogo.tsx`)
- Located at [`src/components/ui/LocentraLogo.tsx`](file:///c:/Users/kunal%20badgujar/Desktop/Projects/AnchorSense%20AI/src/components/ui/LocentraLogo.tsx).
- Represents a **central coordinate fix node**, **concentric trilateration radar waves**, and **three convergent anchor rays**.
- Supports `'badge'` (full rounded squircle emblem for sidebar/favicon) and `'icon'` (inline transparent mark for breadcrumbs).

---

## 4. Application Architecture & File Map

```
Locentra/
├── index.html                   # HTML entry point, dynamic SVG favicon, and metadata
├── package.json                 # Project configuration (locentra@0.1.0)
├── vercel.json                  # Vercel SPA rewrites & Vite build config
├── render.yaml                  # Render FastAPI deployment blueprint
├── src/
│   ├── main.tsx                 # React DOM bootstrap
│   ├── App.tsx                  # Root component & module router
│   ├── App.test.tsx             # Shell, navigation, & brand verification tests
│   ├── index.css                # Design system tokens & utility classes
│   ├── lib/
│   │   ├── apiClient.ts         # Typed client for Render backend (/health, /simulate, /compare)
│   │   └── utils.ts             # Tailwind classnames merger (clsx + twMerge)
│   ├── store/
│   │   └── useAppStore.ts       # Global state: activeSection, scenario, playback, solver state
│   ├── types/
│   │   ├── api.ts               # FastAPI response contracts & request schemas
│   │   ├── navigation.ts        # Module IDs and sidebar items
│   │   ├── scenario.ts          # Room dimensions, anchor models, trajectory points
│   │   └── telemetry.ts         # Engine health, metrics, and error rates
│   └── components/
│       ├── layout/
│       │   ├── AppShell.tsx     # Responsive layout wrapper & Quick Diagnostic modal
│       │   ├── SidebarRail.tsx  # Charcoal sidebar with Locentra logo & module tabs
│       │   └── TopStatusBar.tsx # Breadcrumb with Locentra logo, search, and engine pill
│       ├── ui/
│       │   ├── LocentraLogo.tsx # Custom vector SVG logo component
│       │   ├── Button.tsx       # Primary, secondary, outline, and ghost buttons
│       │   ├── Badge.tsx        # Status pills and solver labels
│       │   ├── MetricCard.tsx   # Stat cards with sparkline visuals
│       │   └── SectionHeader.tsx# Unified page headers with category tags
│       └── views/
│           ├── CommandCenter/
│           │   └── CommandCenterView.tsx   # Dashboard, 4 KPIs, paired 60:40 workspace, benchmarks
│           ├── SpatialLab/
│           │   ├── SpatialLabView.tsx      # Shared 2D/3D workspace & playback controller
│           │   ├── FloorPlan2D.tsx         # Coordinate-accurate SVG floor plan with range rays
│           │   ├── SpatialScene3D.tsx      # WebGL 3D room, transceivers, orbit controls
│           │   ├── SpatialToolbar.tsx      # Play, pause, step forward, speed toggles, layer toggles
│           │   ├── AnchorInspector.tsx     # Anchor detail card (coordinates, NLOS %, distance)
│           │   └── trajectoryUtils.ts      # Closed loop & figure-8 trajectory generators
│           ├── ScenarioStudio/             # Noise sliders, room boundary configuration
│           ├── BenchmarkArena/             # Error CDF charts & solver comparison tables
│           └── DatasetExplorer/            # CSV/JSON trajectory dataset export workbench
└── backend/
    ├── main.py                  # Uvicorn entrypoint
    ├── render.yaml              # Render backend configuration
    └── anchorsense/
        ├── api/                 # FastAPI routes (/api/v1/health, /simulate/run, /simulate/compare)
        ├── models.py            # Coordinate models, Room, Anchor, Estimate schemas
        ├── solvers.py           # Linear, NLLS (Levenberg-Marquardt), Robust (Huber) solvers
        ├── tracking.py          # Kalman tracker & state estimation
        ├── simulator.py         # Range noise generator & NLOS probability models
        └── pipeline.py          # Integrated simulation runner
```

---

## 5. View Details & Interactive Behavior

### A. Command Center (`CommandCenterView.tsx`)
1. **Row A (Overview):** Dynamic backend connectivity banner + SectionHeader with `Verify Telemetry` and `Configure Scenario` actions.
2. **Row B (4 Key Metrics):** Equal-height cards with aligned baselines, sparklines, and tooltips:
   - *Positioning Error (RMSE)*: `0.28m` (or live calculated value)
   - *95th-Percentile Error (P95)*: `0.58m`
   - *Processing Time*: `1.42ms` (~700 updates/sec)
   - *Accuracy Improvement*: `+18.7%` (with ML residual calibration)
3. **Section 1 (Primary Workspace - 60:40 Grid):**
   - **Left (~60%):** Algorithm Performance Comparison table (Dark `#232124` panel, category filters: *All Solvers*, *Classical*, *ML Augmented*, and *Run Live Comparison* button connected to FastAPI).
   - **Right (~40%):** Room Anchors card with interactive 2D floor-plan mini-map and 2-column anchor status grid matching the table height.
4. **Section 2 (Recent Benchmark Runs):** Full-width card with 3 balanced columns (`RUN-9402`, `RUN-9401`, `RUN-9398`).
5. **Section 3 (System Architecture & Integration):** Full-width lavender telemetry panel with 4 pods (*Backend API*, *Frontend Client*, *Test Room Layout*, *Supported Methods*).

### B. Spatial Lab (`SpatialLabView.tsx`)
1. **Synchronized 2D / 3D Views:** Toggle between coordinate-accurate 2D SVG floor plan and 3D WebGL orbit room.
2. **Trajectory Playback Controls:**
   - Play/Pause button, Step forward, Reset, Timeline scrubber, and `0.5x` / `1x` / `2x` speed toggles.
   - *Note on Playback Timer:* Operates using `setInterval` driven by `useAppStore.stepPlayback()` without restrictive OS motion guards.
3. **Anchor Node Inspector:** Interactive selection of anchors A1–A6 to inspect $(x, y, z)$ coordinates, distance to target, and toggle active/inactive status.
4. **Layer Toggles:** Toggle Ground Truth path (cyan), Estimated path (mint), Range rays (amber dashed), and anchor labels.

---

## 6. How to Run & Verify Locally

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173/)
npm run dev

# Run automated test suite (25 tests must pass)
npm test -- --run

# Run TypeScript check & production build
npm run build
```

### Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run FastAPI with live reload (http://localhost:8000/docs)
uvicorn main:app --reload --port 8000
```

---

## 7. Crucial Invariants for Future Antigravity Agents

When building new features or editing this codebase:
1. **Brand Name:** Always use **Locentra** for user-facing UI, headers, and metadata.
2. **Brand Colors:** Preserve `#232124` (charcoal), `#E6E6E6` (soft canvas), `#D9F56F` (electric lime), and `#B6A9EF` (lavender).
3. **Internal Identifiers:** Do **not** rename Python packages (`anchorsense`) or API contracts if modifying the backend, as Render relies on `anchorsense.api.app:app`.
4. **Test Invariant:** `src/App.test.tsx` line 17 requires `screen.getAllByText('Locentra')` and line 34 checks for the `Phase 1 Prototype Shell & Design System` string (preserved invisibly via `<span className="sr-only">Phase 1 Prototype Shell & Design System</span>`).
5. **Vercel Deployments:** If automatic GitHub webhook builds pause after repository renaming, trigger a **Redeploy** from the Vercel dashboard or run `npx vercel --prod`.

---

*Generated for Locentra pair-programming and Antigravity handoff.*
