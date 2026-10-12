import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getApiBaseUrl, 
  ApiError, 
  fetchDefaultConfig, 
  runSimulation, 
  compareSimulations, 
  mapSimulationToTrajectoryPoints 
} from './apiClient';
import { SimulationRunResponse, SimulationCompareResponse, DefaultConfigResponse } from '../types/api';

describe('API Client & Trajectory Mapping (Phase 5)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('Base URL Configuration', () => {
    it('returns a valid string for getApiBaseUrl', () => {
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
    });
  });

  describe('mapSimulationToTrajectoryPoints', () => {
    it('accurately maps ground truth and valid estimates into TrajectoryPoint[]', () => {
      const mockResponse: SimulationRunResponse = {
        scenario_id: 'test-scenario',
        algorithm_name: 'Robust NLS',
        trajectory_type: 'closed_loop',
        num_points: 2,
        timestamps: [0.0, 0.1],
        measurements: [],
        effective_config: {},
        metrics: {
          rmse_m: 0.12,
          mean_error_m: 0.10,
          median_error_m: 0.09,
          p95_error_m: 0.20,
          valid_estimate_rate: 1.0,
          failure_rate: 0.0,
          valid_count: 2,
          failed_count: 0,
          total_count: 2,
        },
        ground_truth: [
          { id: 0, timestamp: 0.0, x: 2.0, y: 3.0, z: 1.1 },
          { id: 1, timestamp: 0.1, x: 2.5, y: 3.2, z: 1.1 },
        ],
        estimates: [
          { timestamp: 0.0, x: 2.1, y: 3.05, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
          { timestamp: 0.1, x: 2.45, y: 3.18, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
        ],
      };

      const points = mapSimulationToTrajectoryPoints(mockResponse);

      expect(points).toHaveLength(2);
      expect(points[0].x).toBe(2.0);
      expect(points[0].y).toBe(3.0);
      expect(points[0].estimatedX).toBe(2.1);
      expect(points[0].estimatedY).toBe(3.05);
      expect(points[0].isDegraded).toBe(false);
      expect(points[0].status).toBe('valid');
      expect(points[0].errorMeters).toBeCloseTo(Math.hypot(0.1, 0.05), 3);
    });

    it('gracefully flags failed or degraded estimates and retains spatial continuity', () => {
      const mockResponse: SimulationRunResponse = {
        scenario_id: 'test-scenario',
        algorithm_name: 'Extended Kalman Filter',
        trajectory_type: 'straight_line',
        num_points: 2,
        timestamps: [0.0, 0.1],
        measurements: [],
        effective_config: {},
        metrics: {
          rmse_m: 0.35,
          mean_error_m: 0.30,
          median_error_m: 0.28,
          p95_error_m: 0.50,
          valid_estimate_rate: 0.5,
          failure_rate: 0.5,
          valid_count: 1,
          failed_count: 1,
          total_count: 2,
        },
        ground_truth: [
          { id: 0, timestamp: 0.0, x: 1.0, y: 1.0, z: 1.1 },
          { id: 1, timestamp: 0.1, x: 2.0, y: 2.0, z: 1.1 },
        ],
        estimates: [
          { timestamp: 0.0, x: 1.05, y: 1.02, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: true },
          { timestamp: 0.1, x: null, y: null, status: 'failed', solver_cost: null, num_valid_measurements: 1, convergence_message: 'insufficient', is_kalman_updated: false },
        ],
      };

      const points = mapSimulationToTrajectoryPoints(mockResponse);

      expect(points).toHaveLength(2);
      expect(points[0].isDegraded).toBe(false);
      expect(points[1].isDegraded).toBe(true);
      expect(points[1].status).toBe('failed');
      // Carries forward previous estimated position (1.05, 1.02)
      expect(points[1].estimatedX).toBe(1.05);
      expect(points[1].estimatedY).toBe(1.02);
      expect(points[1].errorMeters).toBeCloseTo(Math.hypot(2.0 - 1.05, 2.0 - 1.02), 3);
    });

    it('returns empty array if ground truth is empty or missing', () => {
      const mockResponse: SimulationRunResponse = {
        scenario_id: 'empty',
        algorithm_name: 'None',
        trajectory_type: 'closed_loop',
        num_points: 0,
        timestamps: [],
        measurements: [],
        effective_config: {},
        metrics: {
          rmse_m: null,
          mean_error_m: null,
          median_error_m: null,
          p95_error_m: null,
          valid_estimate_rate: 0,
          failure_rate: 1,
          valid_count: 0,
          failed_count: 0,
          total_count: 0,
        },
        ground_truth: [],
        estimates: [],
      };

      expect(mapSimulationToTrajectoryPoints(mockResponse)).toEqual([]);
    });
  });

  describe('fetchDefaultConfig', () => {
    it('fetches and returns default configuration from backend', async () => {
      const mockConfig: DefaultConfigResponse = {
        room: { width: 12.0, length: 8.0, height: 3.5 },
        nominal_tag_height: 1.1,
        anchors: [
          { id: 'A1', x: 0.5, y: 0.5, z: 2.8, is_active: true },
        ],
        simulation_defaults: {
          num_points: 80,
          sampling_interval: 0.25,
          noise_std_dev: 0.15,
          dropout_rate: 0.04,
          outlier_rate: 0.02,
          outlier_magnitude: 5.0,
          nlos_bias_mean: 0.35,
          nlos_rate: 0.10,
          trajectory_type: 'closed_loop',
          target_z: 1.1,
          seed: 42,
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockConfig,
      } as Response);

      const result = await fetchDefaultConfig();
      expect(result.room.width).toBe(12.0);
      expect(result.room.length).toBe(8.0);
      expect(result.anchors[0].id).toBe('A1');
    });

    it('throws ApiError when response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => JSON.stringify({ detail: 'Backend calculation failed' }),
      } as Response);

      await expect(fetchDefaultConfig()).rejects.toThrow(ApiError);
    });
  });

  describe('runSimulation', () => {
    it('posts simulation parameters and returns valid simulation response', async () => {
      const mockSimResponse: SimulationRunResponse = {
        scenario_id: 'sim-1',
        algorithm_name: 'Robust NLS',
        trajectory_type: 'closed_loop',
        num_points: 60,
        timestamps: [0],
        measurements: [],
        effective_config: {},
        metrics: {
          rmse_m: 0.15,
          mean_error_m: 0.12,
          median_error_m: 0.11,
          p95_error_m: 0.28,
          valid_estimate_rate: 1.0,
          failure_rate: 0.0,
          valid_count: 60,
          failed_count: 0,
          total_count: 60,
        },
        ground_truth: [{ id: 0, timestamp: 0, x: 2, y: 2, z: 1.1 }],
        estimates: [{ timestamp: 0, x: 2.1, y: 2.05, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSimResponse,
      } as Response);

      const result = await runSimulation({
        solver: 'robust_nls',
        num_points: 60,
        noise_std_dev: 0.15,
      });

      expect(result.metrics.rmse_m).toBe(0.15);
      expect(result.algorithm_name).toBe('Robust NLS');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/simulations/run'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      );
    });

    it('throws ApiError on HTTP 422 Unprocessable Entity', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        text: async () => JSON.stringify({ detail: 'num_points must be <= 500' }),
      } as Response);

      await expect(runSimulation({ num_points: 999 })).rejects.toThrow(ApiError);
    });
  });

  describe('compareSimulations', () => {
    it('executes comparison endpoint and returns multi-solver results', async () => {
      const mockCompare: SimulationCompareResponse = {
        scenario_id: 'compare-1',
        trajectory_type: 'closed_loop',
        num_points: 60,
        timestamps: [0],
        ground_truth: [],
        measurements: [],
        effective_config: { noise_std_dev: 0.15 },
        solvers: {
          robust_nls: {
            name: 'Robust Non-Linear Least Squares',
            estimates: [],
            metrics: {
              rmse_m: 0.22,
              mean_error_m: 0.18,
              median_error_m: 0.17,
              p95_error_m: 0.40,
              valid_estimate_rate: 0.98,
              failure_rate: 0.02,
              valid_count: 59,
              failed_count: 1,
              total_count: 60,
            },
          },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockCompare,
      } as Response);

      const res = await compareSimulations({ num_points: 60 });
      expect(Object.keys(res.solvers)).toContain('robust_nls');
      expect(res.solvers['robust_nls'].metrics.rmse_m).toBe(0.22);
    });
  });
});
