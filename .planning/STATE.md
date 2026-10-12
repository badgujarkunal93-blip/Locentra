# AnchorSense AI — Current State

## Current Phase: Phase 2 (Interactive 2D/3D Spatial Environment) [COMPLETED]
- Status: Phase 2 implemented, tested, and verified against all acceptance criteria.
- Verification Results:
  - Vitest Unit & Integration Tests: 12/12 tests passing across 2 test suites (100%).
  - Production Build: `tsc -b && vite build` succeeded (0 errors, 0 warnings).
  - Clean TypeScript: Strict mode enabled, zero lint or compiler errors.
  - Performance: Lightweight 3D geometries, no post-processing overhead, responsive canvas, and robust animation cleanup.

## Implemented in Phase 2:
- **Shared Scenario Model & Zustand State**:
  - `src/types/scenario.ts` extended with `TrajectoryPoint`, `SpatialViewMode`, and room parameters.
  - Zustand store (`src/store/useAppStore.ts`) expanded with shared spatial state: `spatialViewMode`, `selectedAnchorId`, `toggleAnchorActive`, `playbackIndex`, `isPlaying`, `playbackSpeed`, `trajectory`, and visibility layer toggles.
- **Deterministic Demonstration Trajectory**:
  - `src/components/views/SpatialLab/trajectoryUtils.ts`: Reproducible 80-point closed-loop path within 12m x 8m room boundaries, deterministic pseudo-error estimates, and Euclidean distance calculators.
- **Coordinate-Accurate 2D Floor Plan** (`src/components/views/SpatialLab/FloorPlan2D.tsx`):
  - Strict linear coordinate scaling from metres to SVG pixels.
  - Room boundaries, 1m and 2m grid lines with numeric axis markings.
  - Anchor beacons (A1..A6) with active/inactive indicators and selection halo.
  - Ground truth (cyan) and demonstration estimate (mint) trajectories and real-time markers.
  - Range measurement rays connecting active anchors to the target with live distance labels.
  - Error displacement vector connecting GT and estimated positions.
- **Interactive 3D Spatial Environment** (`src/components/views/SpatialLab/SpatialScene3D.tsx`):
  - React Three Fiber (`<Canvas>`) and `@react-three/drei` (`OrbitControls`, `Billboard`, `Text`).
  - Wireframe room boundaries, corner pillars, and floor grid helper.
  - 3D anchor transceivers with ceiling mounts, beacon lights, and billboard labels.
  - 3D ground truth and estimated trajectories and target sphere/octahedron.
  - 3D range rays connecting active anchors to the target.
  - Orbit, pan, zoom, plus preset camera views (Perspective & Top-Down).
- **Controls & Interaction**:
  - `SpatialToolbar.tsx`: Seamless 2D/3D toggle, play/pause, step forward, reset, 0.5x/1.0x/2.0x speed, timeline scrubber, and layer visibility toggles.
  - `AnchorInspector.tsx`: Node switcher, coordinate inspection, channel status, live distance-to-target, and active/inactive toggle updating both 2D and 3D instantaneously.
  - `SpatialLegend.tsx`: Symbology key with explicit demonstration baseline notice.
- **Testing**:
  - `src/components/views/SpatialLab/SpatialLab.test.tsx`: 6 new dedicated tests covering 2D/3D toggling, anchor selection, active/inactive switching, playback controls, and layer visibility.
  - `src/App.test.tsx`: Updated and passing 6 tests for navigation and shell.

## Pre-Phase 3 Deployment Readiness [COMPLETED]
- Status: Production build, Vitest suite, and Vercel configuration verified.
- Vercel Configuration: `vercel.json` added with Vite framework preset, `dist` output, and SPA rewrites (`/(.*)` -> `/index.html`).
- Git & Remote: Git repository initialized, `.gitignore` created to prevent leaking node_modules or build artifacts, remote linked to `https://github.com/badgujarkunal93-blip/Locentra.git`.
- Verification: 12/12 Vitest tests pass; `tsc -b && vite build` cleanly outputs optimized assets.

## Next Up:
- **Phase 3**: Python Simulator and Positioning Algorithms (synthetic trajectory generator, realistic range measurement simulator with Gaussian noise, NLOS exponential bias, multipath dropout, and mathematical solvers: Non-linear Least Squares / Levenberg-Marquardt, Extended Kalman Filter, and Trilateration).
