import { TrajectoryPoint } from '../../../types/scenario';

/**
 * Generates a deterministic, reproducible closed-loop demonstration trajectory
 * bounded within the room coordinates (12m x 8m).
 *
 * All estimates are explicitly deterministic demonstration values, NOT live solver calculations.
 */
export function generateDemonstrationTrajectory(numPoints: number = 80): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];
  const centerX = 6.0;
  const centerY = 4.0;
  const radiusX = 4.2;
  const radiusY = 2.5;

  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * 2 * Math.PI;

    // Smooth Lemniscate / Figure-8 trajectory
    const gtX = centerX + radiusX * Math.sin(t);
    const gtY = centerY + (radiusY * Math.sin(2 * t)) / 1.7;
    const gtZ = 1.1 + 0.15 * Math.sin(t * 2); // waist-level mobile tag

    // Deterministic pseudo-error mimicking typical Kalman filter tracking lag & multipath
    const errorOffsetX = 0.18 * Math.sin(3 * t) + 0.06 * Math.cos(t * 5);
    const errorOffsetY = -0.16 * Math.cos(2.5 * t) + 0.08 * Math.sin(t * 4);
    const estX = Math.max(0.2, Math.min(11.8, gtX + errorOffsetX));
    const estY = Math.max(0.2, Math.min(7.8, gtY + errorOffsetY));
    const estZ = gtZ;

    const errorMeters = Math.hypot(estX - gtX, estY - gtY);

    points.push({
      id: i,
      x: Number(gtX.toFixed(3)),
      y: Number(gtY.toFixed(3)),
      z: Number(gtZ.toFixed(3)),
      timestamp: Number((i * 0.25).toFixed(2)), // 4 Hz steps
      estimatedX: Number(estX.toFixed(3)),
      estimatedY: Number(estY.toFixed(3)),
      estimatedZ: Number(estZ.toFixed(3)),
      errorMeters: Number(errorMeters.toFixed(3)),
    });
  }

  return points;
}

/**
 * Calculates Euclidean distance between an anchor and target point in 3D/2D space.
 */
export function calculateDistance(
  p1: { x: number; y: number; z?: number },
  p2: { x: number; y: number; z?: number }
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z ?? 0) - (p2.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
