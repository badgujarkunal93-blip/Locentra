/**
 * Types and interfaces for Dataset Explorer & Trajectory Vault (Phase 6.6)
 */

export type DatasetViewTab = 'trajectories' | 'observations' | 'splits' | 'audit';

export type SplitType = 'train' | 'validation' | 'test';

export interface TrajectoryPointData {
  id: number;
  x: number;
  y: number;
  z: number;
  timestamp: number;
  estimatedX?: number;
  estimatedY?: number;
  estimatedZ?: number;
  errorMeters?: number;
}

export interface TrajectoryDatasetItem {
  id: string;
  name: string;
  motionType: 'figure_eight' | 'corridor_perimeter' | 'random_walk' | 'sharp_turns' | 'straight_line' | 'curved';
  motionModel: string;
  waypointsCount: number;
  lengthMeters: number;
  noiseLevelLabel: string;
  noiseStdDevMeters: number;
  split: SplitType;
  seed: number;
  createdAt: string;
  environmentName: string;
  points: TrajectoryPointData[];
}

export interface RawRangeObservation {
  id: string;
  timestampSec: number;
  trajectoryId: string;
  anchorId: string;
  trueRangeMeters: number;
  measuredRangeMeters: number | null;
  noiseMeters: number;
  state: 'valid' | 'dropout' | 'nlos' | 'outlier';
}

export interface QualityCheckItem {
  id: string;
  name: string;
  status: 'passed' | 'warning' | 'failed' | 'pending';
  issueCount: number;
  explanation: string;
  metricValue?: string;
}

export interface LeakageCheckItem {
  id: string;
  name: string;
  passed: boolean;
  explanation: string;
}

export interface DatasetCorpusStats {
  totalDatasets: number;
  trainCount: number;
  valCount: number;
  testCount: number;
  totalWaypoints: number;
  totalObservations: number;
  trainPercent: number;
  valPercent: number;
  testPercent: number;
  qualityPassRate: number;
}
