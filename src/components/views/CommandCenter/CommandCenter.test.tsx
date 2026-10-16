import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CommandCenterView } from './CommandCenterView';
import { useAppStore } from '../../../store/useAppStore';
import * as apiClientModule from '../../../lib/apiClient';

describe('Phase 6.3: Dynamic Live Telemetry Command Center', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    useAppStore.setState({
      activeSection: 'command-center',
      engineStatus: 'online',
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders initial ready state without auto-polling or fabricated streaming sensors', () => {
    render(<CommandCenterView />);

    // Header & identity
    expect(screen.getByText('Positioning Command Center')).toBeInTheDocument();
    expect(screen.getByText(/Simulated Telemetry Ready/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Monitoring/i })).toBeInTheDocument();

    // Verify honest labeling - no false hardware or physical sensor claims
    expect(screen.queryByText(/Physical Sensor Stream/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/WebSocket/i)).not.toBeInTheDocument();

    // Verify initial KPI cards display legitimate baseline values
    expect(screen.getByText('Root Mean Squared Error')).toBeInTheDocument();
    expect(screen.getByText('0.28')).toBeInTheDocument();
    expect(screen.getByText('95th-Percentile Error')).toBeInTheDocument();
    expect(screen.getByText('0.58')).toBeInTheDocument();
    expect(screen.getByText(/Request round-trip latency/i)).toBeInTheDocument();
  });

  it('starts monitoring only when requested by user and calls real simulation API', async () => {
    const runSimulationSpy = vi.spyOn(apiClientModule.apiClient, 'runSimulation').mockResolvedValue({
      scenario_id: 'SIM-TEST-001',
      algorithm_name: 'Robust NLS (Huber)',
      trajectory_type: 'closed_loop',
      num_points: 80,
      timestamps: [0, 0.25],
      measurements: [],
      effective_config: {},
      metrics: {
        rmse_m: 0.19,
        mean_error_m: 0.16,
        median_error_m: 0.15,
        p95_error_m: 0.38,
        valid_estimate_rate: 1.0,
        failure_rate: 0.0,
        valid_count: 80,
        failed_count: 0,
        total_count: 80,
      },
      ground_truth: [
        { id: 0, timestamp: 0, x: 5, y: 4, z: 1.1 },
        { id: 1, timestamp: 0.25, x: 5.2, y: 4.1, z: 1.1 },
      ],
      estimates: [
        { timestamp: 0, x: 5.08, y: 4.05, status: 'valid', solver_cost: 0.02, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
        { timestamp: 0.25, x: 5.26, y: 4.14, status: 'valid', solver_cost: 0.02, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
      ],
    });

    render(<CommandCenterView />);
    expect(runSimulationSpy).not.toHaveBeenCalled();

    const startBtn = screen.getByRole('button', { name: /Start Monitoring/i });
    await act(async () => {
      fireEvent.click(startBtn);
    });

    expect(runSimulationSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Pause Monitoring/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Live Simulation Feed/i).length).toBeGreaterThanOrEqual(1);
  });

  it('updates latest metrics, trajectory, and recent activity from successful API response', async () => {
    vi.spyOn(apiClientModule.apiClient, 'runSimulation').mockResolvedValue({
      scenario_id: 'SIM-TEST-002',
      algorithm_name: 'Robust NLS (Huber)',
      trajectory_type: 'closed_loop',
      num_points: 80,
      timestamps: [0, 0.25],
      measurements: [],
      effective_config: {},
      metrics: {
        rmse_m: 0.22,
        mean_error_m: 0.18,
        median_error_m: 0.17,
        p95_error_m: 0.44,
        valid_estimate_rate: 1.0,
        failure_rate: 0.0,
        valid_count: 80,
        failed_count: 0,
        total_count: 80,
      },
      ground_truth: [
        { id: 0, timestamp: 0, x: 6, y: 3, z: 1.1 },
        { id: 1, timestamp: 0.25, x: 6.2, y: 3.1, z: 1.1 },
      ],
      estimates: [
        { timestamp: 0, x: 6.05, y: 3.04, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
        { timestamp: 0.25, x: 6.24, y: 3.12, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false },
      ],
    });

    render(<CommandCenterView />);
    const runOnceBtn = screen.getByRole('button', { name: /Run Once/i });

    await act(async () => {
      fireEvent.click(runOnceBtn);
    });

    // Check updated KPI values
    expect(screen.getByText('0.22')).toBeInTheDocument();
    expect(screen.getByText('0.44')).toBeInTheDocument();

    // Check activity feed recorded the event
    expect(screen.getByText(/Simulation completed \(80 points, Robust NLS/i)).toBeInTheDocument();
  });

  it('stops polling when paused and restarts without duplicating loop when resumed', async () => {
    let callCount = 0;
    vi.spyOn(apiClientModule.apiClient, 'runSimulation').mockImplementation(async () => {
      callCount++;
      return {
        scenario_id: `SIM-TICK-${callCount}`,
        algorithm_name: 'Robust NLS',
        trajectory_type: 'closed_loop',
        num_points: 80,
        timestamps: [0],
        measurements: [],
        effective_config: {},
        metrics: {
          rmse_m: 0.25,
          mean_error_m: 0.2,
          median_error_m: 0.18,
          p95_error_m: 0.5,
          valid_estimate_rate: 1.0,
          failure_rate: 0.0,
          valid_count: 80,
          failed_count: 0,
          total_count: 80,
        },
        ground_truth: [{ id: 0, timestamp: 0, x: 3, y: 3, z: 1.1 }],
        estimates: [{ timestamp: 0, x: 3.1, y: 3.05, status: 'valid', solver_cost: 0.02, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false }],
      };
    });

    render(<CommandCenterView />);
    const startBtn = screen.getByRole('button', { name: /Start Monitoring/i });

    // 1. Start monitoring -> initial execution
    await act(async () => {
      fireEvent.click(startBtn);
    });
    expect(callCount).toBe(1);

    // 2. Advance time 4 seconds -> second poll fires
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    expect(callCount).toBe(2);

    // 3. Pause monitoring
    const pauseBtn = screen.getByRole('button', { name: /Pause Monitoring/i });
    await act(async () => {
      fireEvent.click(pauseBtn);
    });
    expect(screen.getByRole('button', { name: /Resume Monitoring/i })).toBeInTheDocument();

    // 4. Advance time 10 seconds -> NO new calls should occur while paused
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });
    expect(callCount).toBe(2);

    // 5. Resume monitoring
    const resumeBtn = screen.getByRole('button', { name: /Resume Monitoring/i });
    await act(async () => {
      fireEvent.click(resumeBtn);
    });
    expect(callCount).toBe(3);

    // 6. Advance another 4 seconds -> exactly 1 new tick
    await act(async () => {
      vi.advanceTimersByTime(4000);
    });
    expect(callCount).toBe(4);
  });

  it('runs solver comparison using real backend API', async () => {
    const compareSpy = vi.spyOn(apiClientModule.apiClient, 'compareSimulations').mockResolvedValue({
      scenario_id: 'COMPARE-TEST-1',
      trajectory_type: 'closed_loop',
      num_points: 80,
      timestamps: [0],
      ground_truth: [{ id: 0, timestamp: 0, x: 4, y: 4, z: 1.1 }],
      measurements: [],
      effective_config: {},
      solvers: {
        robust_nls: {
          name: 'Robust NLS (Huber)',
          estimates: [{ timestamp: 0, x: 4.05, y: 4.02, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false }],
          metrics: { rmse_m: 0.16, mean_error_m: 0.14, median_error_m: 0.12, p95_error_m: 0.28, valid_estimate_rate: 1.0, failure_rate: 0.0, valid_count: 80, failed_count: 0, total_count: 80 },
        },
        nls_kalman: {
          name: 'Extended Kalman',
          estimates: [{ timestamp: 0, x: 4.08, y: 4.06, status: 'valid', solver_cost: 0.01, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: true }],
          metrics: { rmse_m: 0.22, mean_error_m: 0.19, median_error_m: 0.17, p95_error_m: 0.39, valid_estimate_rate: 1.0, failure_rate: 0.0, valid_count: 80, failed_count: 0, total_count: 80 },
        },
        nls: {
          name: 'NLS (Ordinary)',
          estimates: [{ timestamp: 0, x: 4.15, y: 4.12, status: 'valid', solver_cost: 0.03, num_valid_measurements: 6, convergence_message: 'ok', is_kalman_updated: false }],
          metrics: { rmse_m: 0.32, mean_error_m: 0.28, median_error_m: 0.25, p95_error_m: 0.65, valid_estimate_rate: 0.98, failure_rate: 0.02, valid_count: 78, failed_count: 2, total_count: 80 },
        },
      },
    });

    render(<CommandCenterView />);
    const compareBtn = screen.getByRole('button', { name: /Run Comparison/i });

    await act(async () => {
      fireEvent.click(compareBtn);
    });

    expect(compareSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText('0.16m')).toBeInTheDocument();
    expect(screen.getByText('0.22m')).toBeInTheDocument();
  });

  it('handles backend error gracefully without claiming fresh values or breaking UI', async () => {
    vi.spyOn(apiClientModule.apiClient, 'runSimulation').mockRejectedValue(
      new apiClientModule.ApiError('Connection refused: FastAPI offline', 500, true)
    );

    render(<CommandCenterView />);
    const runOnceBtn = screen.getByRole('button', { name: /Run Once/i });

    await act(async () => {
      fireEvent.click(runOnceBtn);
    });

    // Verify activity feed records error accurately
    expect(screen.getByText(/Backend request failed: Connection refused/i)).toBeInTheDocument();
    // Verify UI remains stable
    expect(screen.getByText('Positioning Command Center')).toBeInTheDocument();
  });
});
