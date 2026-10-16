/**
 * Types and interfaces for Benchmark Arena & Error Analysis (Phase 6.5)
 */

export type BenchmarkViewMode = 'cdf' | 'quantiles' | 'monte-carlo';

export interface SolverDisplayMeta {
  id: string;
  name: string;
  shortDesc: string;
  category: 'Optimization' | 'Filtering' | 'Geometric' | 'Hybrid';
  color: string;        // Primary hex, e.g. #159B71
  textColor: string;    // CSS class or hex
  bgColor: string;      // Light background hex, e.g. #E8F8F2
  borderColor: string;  // Border hex
}

export interface SolverQuantiles {
  solverId: string;
  name: string;
  color: string;
  p50: number | null; // Median
  p90: number | null;
  p95: number | null;
  p99: number | null;
  sampleCount: number;
}

export interface CdfDataPoint {
  errorMeters: string;
  errorThreshold: number;
  [solverKey: string]: number | string;
}

export interface BenchmarkHistoryEntry {
  id: string;
  timestamp: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'started' | 'configured' | 'health' | 'failed';
  solverCount?: number;
  pointCount?: number;
  bestSolver?: string;
  bestRmse?: number;
}

export interface MonteCarloRunRecord {
  runIndex: number;
  seed: number;
  durationMs: number;
  status: 'success' | 'failed';
  rmseBySolver: Record<string, number>;
  bestSolverName: string;
  bestRmse: number;
}

export interface MonteCarloSummary {
  totalRuns: number;
  completedRuns: number;
  meanRmseBySolver: Record<string, number>;
  stdDevBySolver: Record<string, number>;
  minRmseBySolver: Record<string, number>;
  maxRmseBySolver: Record<string, number>;
}
