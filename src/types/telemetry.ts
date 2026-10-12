export type EngineStatus = 'online' | 'busy' | 'calibrating' | 'offline';

export type SolverAlgorithm = 
  | 'trilateration'
  | 'nlls_lm' 
  | 'extended_kalman_filter'
  | 'ml_residual_hybrid';

export interface SolverMetricSummary {
  algorithmId: SolverAlgorithm;
  algorithmName: string;
  category: 'Geometric' | 'Optimization' | 'Filtering' | 'Hybrid-ML';
  rmse: number; // meters
  p95Error: number; // meters
  solveLatencyMs: number;
  convergenceRate: number; // percentage
  status: 'active' | 'evaluating' | 'ready';
}

export interface SystemHealthState {
  engineStatus: EngineStatus;
  pythonRuntime: string;
  activeScenarioId: string;
  uptimeSeconds: number;
  totalEstimationsComputed: number;
  telemetryStreamHz: number;
  lastHeartbeat: string;
}

export interface BenchmarkRunSummary {
  id: string;
  timestamp: string;
  trajectoryName: string;
  noiseProfile: string;
  anchorCount: number;
  samplePoints: number;
  bestAlgorithm: string;
  bestRmse: number;
  mlImprovementDelta: number; // percentage change, e.g. -24.5% error reduction
  isIllustrative: boolean;
}
