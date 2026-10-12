# AnchorSense AI — Roadmap

## Phase 1: Frontend Shell and Visual System [COMPLETED]
- Goal: Establish project foundation, styling tokens, application shell, core UI primitives, and 5 views.
- Deliverables:
  - Vite + React + TypeScript + Tailwind CSS v4 setup.
  - Design tokens (charcoal & forest-green surfaces, mint/cyan signal glows, violet ML accents).
  - Application Shell: Left navigation rail, top status bar, active view router.
  - 5 Section Views: Command Center (full-featured preview), Spatial Lab, Scenario Studio, Benchmark Arena, Dataset Explorer.
  - Reusable UI kit: Metric cards, status badges, section headers, tabs, buttons, empty states.
  - Build & test pipeline configured.

## Phase 2: Interactive 2D/3D Spatial Environment [COMPLETED]
- Goal: Coordinate-accurate 2D floor plan (SVG/D3) and lightweight 3D room simulation (Three.js / React Three Fiber / Drei) driven by a unified Zustand scenario model.
- Deliverables:
  - Shared scenario state: Room dimensions, anchors (A1..A6), coordinates, active status, selected anchor, playback state, and layer toggles.
  - SVG 2D Floor Plan: Metre grid, room boundary, active/inactive anchors, range measurement rays, ground-truth and estimated trajectory paths.
  - Three.js / R3F 3D Environment: 3D room mesh, beacon pylons, billboard labels, 3D trajectory lines, range rays, and OrbitControls with camera presets.
  - Playback Toolbar: Play, pause, reset, step, speed selector, timeline scrubber, and layer toggles.
  - Anchor Inspector: Transceiver inspection, live distance to target, and instant activation/deactivation toggle reflected across both 2D and 3D.
  - Symbology Legend & Illustrative Disclaimer: Explicitly labelled deterministic baseline.
  - Tests: 12 passing Vitest unit & integration tests, clean production build.

## Phase 3: Python Simulator and Positioning Algorithms [PENDING]
- Python engine with synthetic trajectory generation and mathematical solvers (Trilateration, NLLS, EKF).

## Phase 4: ML Correction and Benchmark Suite [PENDING]
- Residual learning models and benchmark evaluation suite.

## Phase 5: API Integration and Functional Controls [PENDING]
- FastAPI endpoints linking frontend studio controls with Python execution engine.

## Phase 6: Production Hardening, Documentation and Deployment [PENDING]
- Test coverage, packaging, performance optimization, and comprehensive documentation.
