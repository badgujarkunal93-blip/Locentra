/**
 * TypeScript contracts mirroring FastAPI backend schemas (Phase 4 & 5).
 */

export interface HealthResponse {
  status: string;
  version: string;
  engine: string;
}

export interface RoomSchema {
  width: number;
  length: number;
  height: number;
}

export interface AnchorSchema {
  id: string;
  x: number;
  y: number;
  z: number;
  is_active: boolean;
}

export interface SimulationDefaultsSchema {
  num_points: number;
  sampling_interval: number;
  noise_std_dev: number;
  dropout_rate: number;
  outlier_rate: number;
  outlier_magnitude: number;
  nlos_bias_mean: number;
  nlos_rate: number;
  trajectory_type: string;
  target_z: number;
  seed: number;
}

export interface DefaultConfigResponse {
  room: RoomSchema;
  anchors: AnchorSchema[];
  nominal_tag_height: number;
  simulation_defaults: SimulationDefaultsSchema;
}

export interface TrajectoryPointSchema {
  id: number;
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface RangeMeasurementSchema {
  anchor_id: string;
  true_range: number;
  measured_range: number | null;
  is_nlos: boolean;
  is_outlier: boolean;
  is_dropout: boolean;
}

export interface PositionEstimateSchema {
  timestamp: number;
  x: number | null;
  y: number | null;
  status: 'valid' | 'insufficient_measurements' | 'poor_geometry' | 'solver_failed' | 'invalid_input' | string;
  solver_cost: number | null;
  num_valid_measurements: number;
  convergence_message: string;
  is_kalman_updated: boolean | null;
}

export interface MetricsSchema {
  mean_error_m: number | null;
  median_error_m: number | null;
  p95_error_m: number | null;
  rmse_m: number | null;
  valid_estimate_rate: number;
  failure_rate: number;
  valid_count: number;
  failed_count: number;
  total_count: number;
}

export type SolverType = 'nls' | 'robust_nls' | 'nls_kalman' | 'robust_nls_kalman';
export type TrajectoryShape = 'closed_loop' | 'straight_line' | 'curved';

export interface SimulationRunRequest {
  trajectory_type?: TrajectoryShape;
  num_points?: number;
  sampling_interval?: number;
  noise_std_dev?: number;
  dropout_rate?: number;
  outlier_rate?: number;
  outlier_magnitude?: number;
  nlos_bias_mean?: number;
  nlos_rate?: number;
  target_z?: number;
  solver?: SolverType;
  seed?: number;
  room?: RoomSchema;
  anchors?: AnchorSchema[];
}

export interface SimulationRunResponse {
  scenario_id: string;
  algorithm_name: string;
  trajectory_type: string;
  num_points: number;
  timestamps: number[];
  ground_truth: TrajectoryPointSchema[];
  measurements: RangeMeasurementSchema[][];
  estimates: PositionEstimateSchema[];
  metrics: MetricsSchema;
  effective_config: Record<string, unknown>;
}

export interface SolverComparisonEntry {
  name: string;
  estimates: PositionEstimateSchema[];
  metrics: MetricsSchema;
}

export interface SimulationCompareRequest {
  trajectory_type?: TrajectoryShape;
  num_points?: number;
  sampling_interval?: number;
  noise_std_dev?: number;
  dropout_rate?: number;
  outlier_rate?: number;
  outlier_magnitude?: number;
  nlos_bias_mean?: number;
  nlos_rate?: number;
  target_z?: number;
  enable_kalman?: boolean;
  robust_loss?: 'linear' | 'soft_l1' | 'huber' | 'cauchy' | 'arctan';
  robust_f_scale?: number;
  seed?: number;
  room?: RoomSchema;
  anchors?: AnchorSchema[];
}

export interface SimulationCompareResponse {
  scenario_id: string;
  trajectory_type: string;
  num_points: number;
  timestamps: number[];
  ground_truth: TrajectoryPointSchema[];
  measurements: RangeMeasurementSchema[][];
  solvers: Record<string, SolverComparisonEntry>;
  effective_config: Record<string, unknown>;
}
