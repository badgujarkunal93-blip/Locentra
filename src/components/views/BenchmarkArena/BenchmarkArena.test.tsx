import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BenchmarkArenaView } from './BenchmarkArenaView';
import {
  calculateEuclideanErrors,
  calculateQuantile,
  getQuantilesForSolver,
  generateEmpiricalCdfData,
  generateSparklinePoints,
} from './benchmarkCalculations';
import { useAppStore } from '../../../store/useAppStore';
import * as apiClientModule from '../../../lib/apiClient';

describe('Phase 6.5: Benchmark Arena & Error Analysis Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAppStore.setState({
      benchmarkState: {
        status: 'idle',
        dataSource: 'demo',
        error: null,
        lastCompareResponse: null,
      },
      engineStatus: 'online',
    });
  });

  describe('Mathematical Calculations & Empirical CDF', () => {
    it('calculates exact 2D Euclidean distance between ground truth and estimates', () => {
      const gt = [
        { id: 0, x: 0, y: 0, z: 1.1, timestamp: 0 },
        { id: 1, x: 10, y: 10, z: 1.1, timestamp: 0.1 },
      ];
      const est = [
        { timestamp: 0, x: 3, y: 4, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
        { timestamp: 0.1, x: 10, y: 10, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
      ];

      const errors = calculateEuclideanErrors(gt, est);
      expect(errors).toHaveLength(2);
      expect(errors[0]).toBeCloseTo(5.0, 4); // sqrt(3^2 + 4^2) = 5
      expect(errors[1]).toBeCloseTo(0.0, 4);
    });

    it('filters out missing, null, or failed estimate points without NaN contamination', () => {
      const gt = [
        { id: 0, x: 1, y: 1, z: 1.1, timestamp: 0 },
        { id: 1, x: 2, y: 2, z: 1.1, timestamp: 0.1 },
        { id: 2, x: 3, y: 3, z: 1.1, timestamp: 0.2 },
      ];
      const est = [
        { timestamp: 0, x: 1.1, y: 1.1, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
        { timestamp: 0.1, x: null, y: null, status: 'solver_failed', solver_cost: null, num_valid_measurements: 0, convergence_message: 'diverged', is_kalman_updated: false },
        { timestamp: 0.2, x: 3.05, y: 3.05, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
      ];

      const errors = calculateEuclideanErrors(gt, est);
      expect(errors).toHaveLength(2);
      expect(errors.every((e) => Number.isFinite(e))).toBe(true);
    });

    it('computes linear interpolated quantiles (P50, P90, P95, P99) correctly', () => {
      const sortedErrors = [0.1, 0.2, 0.3, 0.4, 0.5];
      // P50 is index (5 - 1) * 0.5 = 2 -> 0.3
      const p50 = calculateQuantile(sortedErrors, 0.5);
      expect(p50).toBeCloseTo(0.3, 3);

      // P90 is index (5 - 1) * 0.9 = 3.6 -> 0.4 + 0.6 * (0.5 - 0.4) = 0.46
      const p90 = calculateQuantile(sortedErrors, 0.9);
      expect(p90).toBeCloseTo(0.46, 3);

      // Empty or single-item edge cases
      expect(calculateQuantile([], 0.5)).toBeNull();
      expect(calculateQuantile([0.25], 0.5)).toBeCloseTo(0.25, 3);
    });

    it('generates complete SolverQuantiles summary from error observations', () => {
      const errors = [0.15, 0.22, 0.08, 0.35, 0.42, 0.18];
      const quantiles = getQuantilesForSolver('test_solver', 'Test Solver', '#159B71', errors);

      expect(quantiles.solverId).toBe('test_solver');
      expect(quantiles.sampleCount).toBe(6);
      expect(quantiles.p50).not.toBeNull();
      expect(quantiles.p95).not.toBeNull();
      expect(quantiles.p50!).toBeLessThan(quantiles.p95!);
    });

    it('generates empirical cumulative distribution function points starting at 0% and reaching 100%', () => {
      const errorsBySolver = {
        robust_nls: [0.1, 0.2, 0.25, 0.3, 0.4],
        nls: [0.3, 0.4, 0.5, 0.6, 0.8],
      };

      const cdf = generateEmpiricalCdfData(errorsBySolver, 10, 1.0);
      expect(cdf.length).toBe(11);

      // At errorThreshold 0.0, both must be 0%
      expect(cdf[0].robust_nls).toBe(0);
      expect(cdf[0].nls).toBe(0);

      // At errorThreshold 1.0 (above all errors), both must reach 100%
      const lastPoint = cdf[cdf.length - 1];
      expect(lastPoint.robust_nls).toBe(100);
      expect(lastPoint.nls).toBe(100);

      // Robust NLS should dominate (have higher cumulative fraction at 0.3m)
      const pointAt03 = cdf.find((p) => p.errorThreshold === 0.3);
      expect(pointAt03).toBeDefined();
      expect(Number(pointAt03!.robust_nls)).toBeGreaterThan(Number(pointAt03!.nls));
    });

    it('downsamples sparkline points smoothly from real trajectory estimates', () => {
      const gt = Array.from({ length: 40 }, (_, i) => ({ id: i, x: i, y: i, z: 1.1, timestamp: i * 0.1 }));
      const est = Array.from({ length: 40 }, (_, i) => ({
        timestamp: i * 0.1,
        x: i + 0.15,
        y: i + 0.15,
        status: 'valid',
        solver_cost: 0.01,
        num_valid_measurements: 6,
        convergence_message: 'ok',
        is_kalman_updated: false,
      }));

      const sparkline = generateSparklinePoints(gt, est, 10);
      expect(sparkline).toHaveLength(10);
      expect(sparkline.every((val) => typeof val === 'number')).toBe(true);
    });
  });

  describe('UI Rendering, Mode Tabs & Real Backend Flow', () => {
    it('renders header, status row, 4 KPI cards, CDF chart, Quantiles, and Solver Matrix', () => {
      render(<BenchmarkArenaView />);

      // Title & Subtitle
      expect(screen.getByText(/Benchmark Arena & Error Analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/Compare positioning algorithms using measured simulation results/i)).toBeInTheDocument();

      // View selector buttons
      expect(screen.getByRole('button', { name: /Error CDF/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Error Quantiles/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Monte Carlo Runs/i })).toBeInTheDocument();

      // Primary Run Benchmark action
      expect(screen.getByRole('button', { name: /Run Benchmark/i })).toBeInTheDocument();

      // 4 Solver KPI Cards and table rows
      expect(screen.getAllByText(/Robust NLS/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/NLS \+ Kalman/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/NLS \(Ordinary\)/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Baseline Trilateration/i).length).toBeGreaterThan(0);

      // CDF and Quantiles Titles
      expect(screen.getByText(/Empirical Cumulative Distribution of Positioning Error/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Error Quantiles/i })).toBeInTheDocument();
      expect(screen.getByText(/Solver Comparison Matrix/i)).toBeInTheDocument();
      expect(screen.getByText(/Recent Benchmark Runs/i)).toBeInTheDocument();
    });

    it('switches between Error CDF, Error Quantiles, and Monte Carlo Runs tabs cleanly', () => {
      render(<BenchmarkArenaView />);

      const quantilesTab = screen.getByRole('button', { name: /Error Quantiles/i });
      fireEvent.click(quantilesTab);

      // In quantiles view
      expect(screen.getByText(/Positioning error at key percentiles/i)).toBeInTheDocument();

      const monteCarloTab = screen.getByRole('button', { name: /Monte Carlo Runs/i });
      fireEvent.click(monteCarloTab);

      // In Monte Carlo view
      expect(screen.getByText(/Monte Carlo Batch Evaluation/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run Monte Carlo Batch/i })).toBeInTheDocument();
    });

    it('executes real compareSimulations API call when Run Benchmark is clicked and displays live results', async () => {
      const mockCompareResponse = {
        scenario_id: 'cmp-test-123',
        trajectory_type: 'closed_loop',
        num_points: 30,
        timestamps: [0, 0.25],
        ground_truth: [
          { id: 0, x: 2.0, y: 2.0, z: 1.1, timestamp: 0 },
          { id: 1, x: 2.5, y: 2.5, z: 1.1, timestamp: 0.25 },
        ],
        measurements: [],
        effective_config: { noise_std_dev: 0.12 },
        solvers: {
          robust_nls: {
            name: 'Robust Non-Linear Least Squares',
            estimates: [
              { timestamp: 0, x: 2.08, y: 2.08, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
              { timestamp: 0.25, x: 2.55, y: 2.55, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
            ],
            metrics: {
              rmse_m: 0.095,
              mean_error_m: 0.09,
              median_error_m: 0.09,
              p95_error_m: 0.11,
              valid_estimate_rate: 1.0,
              failure_rate: 0.0,
              valid_count: 30,
              failed_count: 0,
              total_count: 30,
            },
          },
          robust_nls_kalman: {
            name: 'Robust NLS + Kalman Filter',
            estimates: [
              { timestamp: 0, x: 2.12, y: 2.12, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: true },
              { timestamp: 0.25, x: 2.58, y: 2.58, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: true },
            ],
            metrics: {
              rmse_m: 0.142,
              mean_error_m: 0.13,
              median_error_m: 0.13,
              p95_error_m: 0.16,
              valid_estimate_rate: 1.0,
              failure_rate: 0.0,
              valid_count: 30,
              failed_count: 0,
              total_count: 30,
            },
          },
        },
      };

      vi.spyOn(apiClientModule.apiClient, 'compareSimulations').mockResolvedValue(mockCompareResponse as any);

      render(<BenchmarkArenaView />);

      const runBtn = screen.getByRole('button', { name: /Run Benchmark/i });
      fireEvent.click(runBtn);

      await waitFor(() => {
        expect(screen.getByText(/Live Numerical Benchmark:/i)).toBeInTheDocument();
        expect(screen.getByText(/Live Python Suite/i)).toBeInTheDocument();
      });

      // Verifies best solver badge and live RMSE
      expect(screen.getAllByText('0.10').length).toBeGreaterThan(0); // 0.095 rounds to 0.10m in card and table
    });

    it('handles benchmark failure gracefully with error notice', async () => {
      vi.spyOn(apiClientModule.apiClient, 'compareSimulations').mockRejectedValue(
        new Error('Failed to connect to positioning engine')
      );

      render(<BenchmarkArenaView />);

      const runBtn = screen.getByRole('button', { name: /Run Benchmark/i });
      fireEvent.click(runBtn);

      await waitFor(() => {
        expect(screen.getByText(/Benchmark Run Failed:/i)).toBeInTheDocument();
      });
    });
  });
});
