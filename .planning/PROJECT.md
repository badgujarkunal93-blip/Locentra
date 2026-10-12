# AnchorSense AI

## Overview
AnchorSense AI is a premium indoor-localisation research platform and spatial-intelligence command centre. The system estimates 2D indoor target positions from noisy or missing reference-point range measurements (e.g. UWB/ToF anchors), handles outliers and biased observations, optionally improves estimates using machine learning, and evaluates performance on unseen synthetic trajectories.

## Architecture
- **Frontend**: React 19 / Vite / TypeScript, Tailwind CSS v4, Lucide React, Zustand, TanStack Query, Recharts, Three.js / React Three Fiber / Drei, Motion for React.
- **Backend (Phases 3-5)**: Python 3.11/3.13, FastAPI, NumPy, SciPy, pandas, scikit-learn.
- **Visual Design**: Spatial-intelligence command centre featuring deep charcoal and forest-green surfaces, mint-green/cyan signal illumination, restrained violet AI accents, technical grid overlays, and responsive telemetry panels.

## 6-Phase Development Plan
1. **Phase 1: Frontend Shell and Visual System** (CURRENT)
   - Project configuration, design system, tokens, application shell (nav rail, top status bar, main viewport).
   - 5 core destinations: Command Center, Spatial Lab, Scenario Studio, Benchmark Arena, Dataset Explorer.
   - Reusable UI component library (metric cards, status indicators, badges, tabs, toolbars, buttons, tooltips).
   - High-fidelity Command Center with illustrative metrics and responsive layouts.
2. **Phase 2: Interactive 2D/3D Spatial Environment**
   - Synchronized 2D floor plan (SVG/D3) and 3D room visualization (Three.js / React Three Fiber / Drei).
   - Shared client scenario state (Zustand).
3. **Phase 3: Python Simulator and Positioning Algorithms**
   - Synthetic trajectory generator, range measurement simulator (Gaussian noise, NLOS bias, multipath dropout).
   - Mathematical positioning solvers (Non-linear Least Squares / Levenberg-Marquardt, Extended Kalman Filter, Trilateration).
4. **Phase 4: ML Correction and Benchmark Suite**
   - Residual error prediction (scikit-learn / gradient boosting / MLP).
   - Reproducible benchmark runner comparing raw trilateration, NLLS, EKF, and ML-enhanced tracking.
5. **Phase 5: API Integration and Functional Controls**
   - FastAPI endpoints connecting frontend Scenario Studio, Benchmark Arena, and Dataset Explorer to Python solvers.
6. **Phase 6: Production Hardening, Documentation and Deployment**
   - End-to-end verification, test suites, performance optimization, and runbook.
