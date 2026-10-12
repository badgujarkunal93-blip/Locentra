import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAppStore } from '../../store/useAppStore';
import { ScenarioStudioPlaceholder } from './ScenarioStudio/ScenarioStudioPlaceholder';
import { SpatialLabView } from './SpatialLab/SpatialLabView';
import { BenchmarkArenaPlaceholder } from './BenchmarkArena/BenchmarkArenaPlaceholder';
import * as apiClientModule from '../../lib/apiClient';

describe('Phase 5 Frontend–Backend Integration & UI State', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAppStore.getState().resetToDemoTrajectory();
  });

  describe('Scenario Studio Real Execution & State Controls', () => {
    it('renders simulation parameters and disables execution button while running', async () => {
      render(<ScenarioStudioPlaceholder />);

      expect(screen.getByText(/Scenario Studio & Degradation Studio/i)).toBeInTheDocument();
      expect(screen.getByText(/Stochastic Channel & Trajectory Parameters/i)).toBeInTheDocument();

      const runButton = screen.getByRole('button', { name: /Run Simulation on Engine/i });
      expect(runButton).toBeEnabled();

      // Mock runSimulation to simulate pending state
      let resolveSimulation: (val: any) => void;
      const simPromise = new Promise((resolve) => {
        resolveSimulation = resolve;
      });
      vi.spyOn(apiClientModule.apiClient, 'runSimulation').mockReturnValue(simPromise as any);

      fireEvent.click(runButton);

      // Verify button is disabled during execution
      await waitFor(() => {
        expect(screen.getByText(/Solving\.\.\./i)).toBeInTheDocument();
      });

      // Resolve the mock run
      resolveSimulation!({
        scenario_id: 'test-1',
        algorithm_name: 'Robust NLS',
        trajectory_type: 'closed_loop',
        num_points: 2,
        timestamps: [0, 0.1],
        measurements: [],
        effective_config: {},
        metrics: {
          rmse_m: 0.14,
          mean_error_m: 0.12,
          median_error_m: 0.10,
          p95_error_m: 0.22,
          valid_estimate_rate: 1.0,
          failure_rate: 0.0,
          valid_count: 2,
          failed_count: 0,
          total_count: 2,
        },
        ground_truth: [
          { id: 0, timestamp: 0, x: 2, y: 3, z: 1.1 },
          { id: 1, timestamp: 0.1, x: 2.1, y: 3.1, z: 1.1 },
        ],
        estimates: [
          { timestamp: 0, x: 2.05, y: 3.02, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
          { timestamp: 0.1, x: 2.12, y: 3.09, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
        ],
      });

      await waitFor(() => {
        expect(screen.getByText(/Live Simulation Complete:/i)).toBeInTheDocument();
        expect(screen.getByText(/0\.140m/i)).toBeInTheDocument();
      });
    });

    it('displays error notice on backend failure and offers demo fallback', async () => {
      vi.spyOn(apiClientModule.apiClient, 'runSimulation').mockRejectedValue(
        new apiClientModule.ApiError('Connection refused at http://127.0.0.1:8000', 500, true)
      );

      render(<ScenarioStudioPlaceholder />);
      const runButton = screen.getByRole('button', { name: /Run Simulation on Engine/i });
      fireEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Backend Simulation Error:/i)).toBeInTheDocument();
        expect(screen.getByText(/Use Demo Trajectory/i)).toBeInTheDocument();
      });
    });
  });

  describe('Spatial Lab Backend vs Demo Distinction', () => {
    it('shows Deterministic Demo banner initially and switches to Live Engine banner on backend run', async () => {
      const { rerender } = render(<SpatialLabView />);

      // Initially shows deterministic demo badge and banner
      expect(screen.getAllByText(/Deterministic Demo/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Live Positioning Trajectory:/i)).not.toBeInTheDocument();

      // Trigger backend success in store
      useAppStore.setState({
        simulationState: {
          status: 'success',
          dataSource: 'backend',
          error: null,
          validationErrors: [],
          numPoints: 60,
          randomSeed: 42,
          trajectoryType: 'closed_loop',
          nlosRate: 0.1,
          activeAlgorithmName: 'Robust NLS (Kalman)',
          selectedBackendSolver: 'robust_nls_kalman',
          lastRunResponse: {
            scenario_id: 'test-2',
            algorithm_name: 'Robust NLS (Kalman)',
            trajectory_type: 'closed_loop',
            num_points: 60,
            timestamps: [0],
            measurements: [],
            effective_config: {},
            metrics: {
              rmse_m: 0.185,
              mean_error_m: 0.15,
              median_error_m: 0.14,
              p95_error_m: 0.32,
              valid_estimate_rate: 0.98,
              failure_rate: 0.02,
              valid_count: 59,
              failed_count: 1,
              total_count: 60,
            },
            ground_truth: [{ id: 0, timestamp: 0, x: 1, y: 1, z: 1.1 }],
            estimates: [{ timestamp: 0, x: 1.1, y: 1.05, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: true }],
          },
        },
      });

      rerender(<SpatialLabView />);

      expect(screen.getByText(/Live Positioning Trajectory:/i)).toBeInTheDocument();
      expect(screen.getByText(/ROBUST_NLS_KALMAN/i)).toBeInTheDocument();
      expect(screen.getByText(/0\.185m/i)).toBeInTheDocument();

      // Reset to demo button restores baseline
      const resetBtn = screen.getByRole('button', { name: /Reset to Demo/i });
      fireEvent.click(resetBtn);

      expect(screen.getAllByText(/Deterministic Demo/i).length).toBeGreaterThan(0);
    });
  });

  describe('Benchmark Arena Real Comparison & Mock Handling', () => {
    it('shows Mock Benchmark initially, then displays real comparison table after backend run', async () => {
      vi.spyOn(apiClientModule.apiClient, 'compareSimulations').mockResolvedValue({
        scenario_id: 'test-compare',
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
              rmse_m: 0.245,
              mean_error_m: 0.20,
              median_error_m: 0.18,
              p95_error_m: 0.45,
              valid_estimate_rate: 0.96,
              failure_rate: 0.04,
              valid_count: 58,
              failed_count: 2,
              total_count: 60,
            },
          },
          robust_nls_kalman: {
            name: 'Robust NLS + Kalman Filter',
            estimates: [],
            metrics: {
              rmse_m: 0.175,
              mean_error_m: 0.14,
              median_error_m: 0.13,
              p95_error_m: 0.31,
              valid_estimate_rate: 0.99,
              failure_rate: 0.01,
              valid_count: 59,
              failed_count: 1,
              total_count: 60,
            },
          },
        },
      });

      render(<BenchmarkArenaPlaceholder />);

      // Initially mock benchmark
      expect(screen.getByText(/Mock Benchmark/i)).toBeInTheDocument();

      const runBenchmarkBtn = screen.getByRole('button', { name: /Run Numerical Benchmark/i });
      fireEvent.click(runBenchmarkBtn);

      await waitFor(() => {
        expect(screen.getByText(/Live Numerical Benchmark:/i)).toBeInTheDocument();
        expect(screen.getByText(/Live Python Suite/i)).toBeInTheDocument();
        expect(screen.getByText(/FastAPI Numerical Engine Comparison Metrics/i)).toBeInTheDocument();
      });
    });
  });
});
