/**
 * Scientific and mathematical calculation utilities for Benchmark Arena (Phase 6.5).
 * Ground truth is strictly an evaluation reference, never a solver input.
 */

import { PositionEstimateSchema, TrajectoryPointSchema } from '../../../types/api';
import { CdfDataPoint, SolverQuantiles } from './types';

/**
 * Computes Euclidean position error for matched valid points:
 * error_i = sqrt((x_est_i - x_gt_i)^2 + (y_est_i - y_gt_i)^2)
 */
export function calculateEuclideanErrors(
  groundTruth: TrajectoryPointSchema[] | undefined,
  estimates: PositionEstimateSchema[] | undefined
): number[] {
  if (!groundTruth || !estimates || groundTruth.length === 0 || estimates.length === 0) {
    return [];
  }

  const errors: number[] = [];
  const count = Math.min(groundTruth.length, estimates.length);

  for (let i = 0; i < count; i++) {
    const gt = groundTruth[i];
    const est = estimates[i];

    if (
      est &&
      est.status === 'valid' &&
      typeof est.x === 'number' &&
      typeof est.y === 'number' &&
      gt &&
      typeof gt.x === 'number' &&
      typeof gt.y === 'number'
    ) {
      const err = Math.hypot(est.x - gt.x, est.y - gt.y);
      if (Number.isFinite(err)) {
        errors.push(err);
      }
    }
  }

  return errors;
}

/**
 * Calculates a specific percentile p in [0, 1] using standard linear interpolation.
 * Expects errors array to be already sorted in ascending order.
 */
export function calculateQuantile(sortedErrors: number[], p: number): number | null {
  if (!sortedErrors || sortedErrors.length === 0) return null;
  if (sortedErrors.length === 1) return Number(sortedErrors[0].toFixed(3));

  const clampedP = Math.max(0, Math.min(1, p));
  const index = (sortedErrors.length - 1) * clampedP;
  const lower = Math.floor(index);
  const upper = Math.min(lower + 1, sortedErrors.length - 1);
  const fraction = index - lower;

  const interpolated = sortedErrors[lower] + fraction * (sortedErrors[upper] - sortedErrors[lower]);
  return Number(interpolated.toFixed(3));
}

/**
 * Generates all 4 standard percentiles (P50, P90, P95, P99) for a solver's observed errors.
 */
export function getQuantilesForSolver(
  solverId: string,
  name: string,
  color: string,
  rawErrors: number[]
): SolverQuantiles {
  const sorted = [...rawErrors].sort((a, b) => a - b);
  return {
    solverId,
    name,
    color,
    p50: calculateQuantile(sorted, 0.5),
    p90: calculateQuantile(sorted, 0.9),
    p95: calculateQuantile(sorted, 0.95),
    p99: calculateQuantile(sorted, 0.99),
    sampleCount: sorted.length,
  };
}

/**
 * Computes the empirical cumulative distribution function (CDF) across defined error thresholds.
 * Evaluates: fraction of samples <= threshold.
 */
export function generateEmpiricalCdfData(
  errorsBySolver: Record<string, number[]>,
  stepCount: number = 20,
  maxCapMeters?: number
): CdfDataPoint[] {
  // Determine upper ceiling for X-axis based on actual maximum observed error across all solvers
  let maxObserved = 0.5;
  Object.values(errorsBySolver).forEach((errs) => {
    errs.forEach((e) => {
      if (e > maxObserved) maxObserved = e;
    });
  });

  // Clamp reasonable plotting ceiling (between 0.8m and 2.5m, unless explicit cap)
  const ceiling = maxCapMeters ?? Math.min(Math.max(maxObserved, 0.8), 2.5);
  const stepSize = ceiling / stepCount;

  const data: CdfDataPoint[] = [];

  for (let i = 0; i <= stepCount; i++) {
    const threshold = Number((i * stepSize).toFixed(2));
    const point: CdfDataPoint = {
      errorMeters: threshold.toFixed(2),
      errorThreshold: threshold,
    };

    Object.entries(errorsBySolver).forEach(([solverKey, errors]) => {
      if (errors.length === 0) {
        point[solverKey] = 0;
      } else {
        const countBelow = errors.filter((e) => e <= threshold).length;
        // Output percentage: 0 to 100
        point[solverKey] = Number(((countBelow / errors.length) * 100).toFixed(1));
      }
    });

    data.push(point);
  }

  return data;
}

/**
 * Extracts a downsampled trend array for mini sparkline visualization from real estimates.
 */
export function generateSparklinePoints(
  groundTruth: TrajectoryPointSchema[] | undefined,
  estimates: PositionEstimateSchema[] | undefined,
  samplePoints: number = 16
): number[] {
  const allErrors = calculateEuclideanErrors(groundTruth, estimates);
  if (allErrors.length === 0) return [];
  if (allErrors.length <= samplePoints) return allErrors;

  const step = (allErrors.length - 1) / (samplePoints - 1);
  const sampled: number[] = [];
  for (let i = 0; i < samplePoints; i++) {
    const idx = Math.round(i * step);
    sampled.push(Number(allErrors[idx].toFixed(3)));
  }
  return sampled;
}
