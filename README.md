# Locentra — Indoor Positioning Platform

Locentra is a spatial-intelligence command centre and indoor localisation research platform. It is engineered to analyse and estimate 2D indoor target coordinates from noisy, missing, or multipath-biased reference-point range measurements (e.g. UWB/ToF anchors), model non-line-of-sight (NLOS) degradations, and benchmark mathematical positioning solvers alongside machine learning residual calibration.

> [!NOTE]
> **Demonstration Baseline Notice:** The spatial trajectory and positional estimates currently rendered in the Phase 1 & Phase 2 interface represent deterministic baseline demonstration data designed for spatial validation and UI verification. The numerical localisation algorithms (Trilateration, Non-linear Least Squares, and Extended Kalman Filter) and stochastic measurement models are scheduled for Phase 3 integration.

---

## Current Features (Phase 1 + Phase 2)

- **Command Center**: Real-time telemetry dashboard, engine health monitor, scenario overview, and quick-action run panel.
- **Spatial Lab (2D Floor Plan)**:
  - Metric coordinate-accurate SVG floor plan with room boundaries and 1m/2m grid markings.
  - Anchor beacon nodes (A1–A6) with active/inactive indicators, selection ring, and live coordinates.
  - Simultaneous ground truth (cyan) and demonstration estimate (mint) paths.
  - Active range measurement rays and real-time error displacement vectors.
- **Spatial Lab (3D Scene)**:
  - Interactive 3D spatial room model powered by Three.js, React Three Fiber, and Drei.
  - 3D anchor transceivers with ceiling mounts, beacon lights, and billboard labels.
  - 3D trajectory visualization with synchronized playback, orbit, pan, zoom, and perspective/top-down camera presets.
- **Interactive Controls & Playback Toolbar**:
  - Play/pause, step forward, reset, timeline scrubber, and 0.5x / 1.0x / 2.0x playback speed toggles.
  - Layer toggles for ground truth, estimated path, anchor labels, and range rays.
  - Instant anchor activation/deactivation reflected synchronously across 2D and 3D views.
- **Scenario Studio (Preview)**: Scenario configuration workspace with room dimensions, anchor layout, and noise parameter controls.
- **Benchmark Arena (Preview)**: Solver evaluation workbench with empirical error CDF charts and accuracy comparison tables.
- **Dataset Explorer (Preview)**: Experimental telemetry capture viewer with filtering and CSV/JSON export capabilities.

---

## Technology Stack

- **Framework & Runtime**: React 19, TypeScript 5.7, Vite 6
- **Styling**: Tailwind CSS v4, custom technical glassmorphism design system
- **3D Visualization**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Charts & Data**: Recharts, D3
- **State Management**: Zustand v5
- **Data Fetching**: TanStack React Query v5
- **Icons & Animation**: Lucide React, Motion
- **Testing**: Vitest, React Testing Library, jsdom

---

## Local Development

### Prerequisites
- Node.js v18+ (tested on Node.js v22)
- npm v10+

### Commands
```bash
# Install dependencies
npm install

# Start local development server (runs on http://localhost:5173)
npm run dev

# Run Vitest test suite (12/12 passing unit & integration tests)
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Vercel Deployment

This project is configured for seamless deployment on [Vercel](https://vercel.com):

1. **Framework Preset**: Vite
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Root Directory**: `./`
5. **SPA Rewrites**: Configured via `vercel.json` to route all direct URL navigation and refreshes to `/index.html`.

### Deploying via GitHub Integration
1. Push repository to GitHub: `https://github.com/badgujarkunal93-blip/Locentra.git`
2. In the [Vercel Dashboard](https://vercel.com/new), select **Import Git Repository**.
3. Choose the `Locentra` repository.
4. Verify the framework is detected as **Vite** and output directory as `dist`.
5. Click **Deploy**.

---

## Roadmap

- [x] **Phase 1: Frontend Shell and Visual System** (Completed)
- [x] **Phase 2: Interactive 2D/3D Spatial Environment** (Completed)
- [ ] **Phase 3: Python Simulator and Positioning Algorithms** (Pending)
- [ ] **Phase 4: ML Correction and Benchmark Suite** (Pending)
- [ ] **Phase 5: API Integration and Functional Controls** (Pending)
- [ ] **Phase 6: Production Hardening, Documentation and Final Release** (Pending)
