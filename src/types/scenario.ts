export interface AnchorNode {
  id: string;
  name: string;
  x: number; // meters
  y: number; // meters
  z?: number; // meters for 3D room height
  isActive: boolean;
  status: 'healthy' | 'degraded' | 'offline';
  nlosProb: number; // 0..1 Non-Line-of-Sight probability
}

export interface TargetPosition {
  x: number;
  y: number;
  z?: number;
  timestamp: number;
}

export interface TrajectoryPoint {
  id: number;
  x: number; // Ground truth X (meters)
  y: number; // Ground truth Y (meters)
  z: number; // Ground truth Z (meters)
  timestamp: number; // time offset (seconds)
  estimatedX: number; // Demonstration estimate X (meters)
  estimatedY: number; // Demonstration estimate Y (meters)
  estimatedZ: number; // Demonstration estimate Z (meters)
  errorMeters: number; // Euclidean distance between GT and estimate
  status?: string; // Estimate status from solver (e.g. 'valid', 'poor_geometry', 'insufficient_measurements')
  isDegraded?: boolean; // Whether the estimate is missing or degraded
}

export interface RangeMeasurement {
  anchorId: string;
  trueDistance: number;
  measuredDistance: number;
  isNlos: boolean;
  isOutlier: boolean;
  residualError?: number;
}

export interface RoomGeometry {
  width: number; // meters
  length: number; // meters
  height: number; // meters
  gridResolution: number; // meters per grid line
}

export type SpatialViewMode = '2d' | '3d';

export interface ScenarioConfiguration {
  id: string;
  name: string;
  description: string;
  room: RoomGeometry;
  anchors: AnchorNode[];
  noiseStdDevMeters: number;
  dropoutRate: number;
  multipathBiasMeanMeters: number;
  selectedSolver: 'trilateration' | 'nlls_lm' | 'extended_kalman_filter' | 'ml_residual_hybrid';
}
