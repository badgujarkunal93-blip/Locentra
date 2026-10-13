import { create } from 'zustand';
import { NavigationSectionId } from '../types/navigation';
import { EngineStatus, SystemHealthState } from '../types/telemetry';
import { ScenarioConfiguration, SpatialViewMode, TrajectoryPoint } from '../types/scenario';
import { generateDemonstrationTrajectory } from '../components/views/SpatialLab/trajectoryUtils';
import { SimulationRunResponse, SimulationCompareResponse, SolverType } from '../types/api';
import { apiClient, mapSimulationToTrajectoryPoints } from '../lib/apiClient';

interface AppState {
  // Navigation
  activeSection: NavigationSectionId;
  setActiveSection: (section: NavigationSectionId) => void;
  viewMode: 'landing' | 'app';
  setViewMode: (mode: 'landing' | 'app') => void;

  // System & Engine telemetry
  engineStatus: EngineStatus;
  setEngineStatus: (status: EngineStatus) => void;
  systemHealth: SystemHealthState;
  
  // Scenario state
  activeScenario: ScenarioConfiguration;
  updateScenario: (partial: Partial<ScenarioConfiguration>) => void;
  toggleAnchorActive: (anchorId: string) => void;

  // Spatial Lab Shared State (Phase 2)
  spatialViewMode: SpatialViewMode;
  setSpatialViewMode: (mode: SpatialViewMode) => void;
  selectedAnchorId: string | null;
  setSelectedAnchorId: (id: string | null) => void;

  // Playback & Trajectory State
  trajectory: TrajectoryPoint[];
  playbackIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5, 1.0, 2.0
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setPlaybackIndex: (index: number) => void;
  stepPlayback: () => void;
  resetPlayback: () => void;

  // Layer Visibility Toggles
  showGroundTruth: boolean;
  toggleGroundTruth: () => void;
  showEstimated: boolean;
  toggleEstimated: () => void;
  showAnchorLabels: boolean;
  toggleAnchorLabels: () => void;
  showRangeRays: boolean;
  toggleRangeRays: () => void;

  // Visual & UI Settings
  isCompactMode: boolean;
  toggleCompactMode: () => void;
  showTechnicalGrid: boolean;
  toggleTechnicalGrid: () => void;
  highContrastSignals: boolean;
  toggleHighContrastSignals: () => void;
  
  // UI Dialogs
  isQuickRunModalOpen: boolean;
  setQuickRunModalOpen: (open: boolean) => void;

  // Real Backend Integration (Phase 5)
  simulationState: {
    status: 'idle' | 'loading' | 'success' | 'error';
    dataSource: 'backend' | 'demo';
    error: string | null;
    validationErrors: string[] | null;
    lastRunResponse: SimulationRunResponse | null;
    activeAlgorithmName: string;
    numPoints: number;
    randomSeed: number;
    trajectoryType: 'closed_loop' | 'straight_line' | 'curved';
    nlosRate: number;
    selectedBackendSolver: SolverType;
  };
  setSimulationParam: (params: Partial<AppState['simulationState']>) => void;
  setSimulationConfig: (params: Partial<AppState['simulationState']>) => void;
  runBackendSimulation: () => Promise<void>;
  resetToDemoTrajectory: () => void;

  benchmarkState: {
    status: 'idle' | 'loading' | 'success' | 'error';
    dataSource: 'backend' | 'demo';
    error: string | null;
    lastCompareResponse: SimulationCompareResponse | null;
  };
  runBackendBenchmark: () => Promise<void>;
  syncBackendConfig: () => Promise<void>;
}

const initialTrajectory = generateDemonstrationTrajectory(80);

let simRequestSeq = 0;
let benchRequestSeq = 0;

export const useAppStore = create<AppState>((set, get) => ({
  activeSection: 'command-center',
  setActiveSection: (section) => set({ activeSection: section }),

  viewMode: (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.MODE === 'test')
    ? 'app'
    : (typeof window !== 'undefined' && (window.location.search.includes('view=app') || window.location.hash === '#app'))
      ? 'app'
      : 'landing',
  setViewMode: (mode) => set({ viewMode: mode }),

  engineStatus: 'online',
  setEngineStatus: (status) => set((state) => ({ 
    engineStatus: status,
    systemHealth: { ...state.systemHealth, engineStatus: status } 
  })),

  systemHealth: {
    engineStatus: 'online',
    pythonRuntime: 'Python 3.13 (Native JIT & SciPy)',
    activeScenarioId: 'lab-warehouse-alpha',
    uptimeSeconds: 14280,
    totalEstimationsComputed: 32490,
    telemetryStreamHz: 20.0,
    lastHeartbeat: new Date().toLocaleTimeString(),
  },

  activeScenario: {
    id: 'lab-warehouse-alpha',
    name: 'Research Hall B — Dense Multipath Corridor',
    description: '12m x 8m test environment configured with 6 peripheral UWB anchor transceivers and intermittent NLOS occlusions.',
    room: {
      width: 12.0,
      length: 8.0,
      height: 3.5,
      gridResolution: 1.0,
    },
    anchors: [
      { id: 'A1', name: 'Anchor #1 (NW)', x: 0.5, y: 0.5, z: 2.8, isActive: true, status: 'healthy', nlosProb: 0.05 },
      { id: 'A2', name: 'Anchor #2 (NE)', x: 11.5, y: 0.5, z: 2.8, isActive: true, status: 'healthy', nlosProb: 0.08 },
      { id: 'A3', name: 'Anchor #3 (SE)', x: 11.5, y: 7.5, z: 2.8, isActive: true, status: 'healthy', nlosProb: 0.15 },
      { id: 'A4', name: 'Anchor #4 (SW)', x: 0.5, y: 7.5, z: 2.8, isActive: true, status: 'healthy', nlosProb: 0.05 },
      { id: 'A5', name: 'Anchor #5 (Mid-N)', x: 6.0, y: 0.2, z: 3.2, isActive: true, status: 'healthy', nlosProb: 0.20 },
      { id: 'A6', name: 'Anchor #6 (Mid-S)', x: 6.0, y: 7.8, z: 3.2, isActive: true, status: 'degraded', nlosProb: 0.42 },
    ],
    noiseStdDevMeters: 0.15,
    dropoutRate: 0.04,
    multipathBiasMeanMeters: 0.35,
    selectedSolver: 'extended_kalman_filter',
  },
  updateScenario: (partial) =>
    set((state) => ({
      activeScenario: { ...state.activeScenario, ...partial },
    })),
  toggleAnchorActive: (anchorId) =>
    set((state) => ({
      activeScenario: {
        ...state.activeScenario,
        anchors: state.activeScenario.anchors.map((a) =>
          a.id === anchorId ? { ...a, isActive: !a.isActive } : a
        ),
      },
    })),

  // Spatial Lab State
  spatialViewMode: '2d',
  setSpatialViewMode: (mode) => set({ spatialViewMode: mode }),
  selectedAnchorId: 'A1',
  setSelectedAnchorId: (id) => set({ selectedAnchorId: id }),

  // Playback State
  trajectory: initialTrajectory,
  playbackIndex: 0,
  isPlaying: true,
  playbackSpeed: 1.0,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setPlaybackIndex: (index) => set({ playbackIndex: index }),
  stepPlayback: () =>
    set((state) => {
      const len = state.trajectory?.length || 0;
      if (len === 0) return state;
      return {
        playbackIndex: (state.playbackIndex + 1) % len,
      };
    }),
  resetPlayback: () => set({ playbackIndex: 0 }),

  // Visibility Toggles
  showGroundTruth: true,
  toggleGroundTruth: () => set((state) => ({ showGroundTruth: !state.showGroundTruth })),
  showEstimated: true,
  toggleEstimated: () => set((state) => ({ showEstimated: !state.showEstimated })),
  showAnchorLabels: true,
  toggleAnchorLabels: () => set((state) => ({ showAnchorLabels: !state.showAnchorLabels })),
  showRangeRays: true,
  toggleRangeRays: () => set((state) => ({ showRangeRays: !state.showRangeRays })),

  // Visual & UI Settings
  isCompactMode: false,
  toggleCompactMode: () => set((state) => ({ isCompactMode: !state.isCompactMode })),
  showTechnicalGrid: true,
  toggleTechnicalGrid: () => set((state) => ({ showTechnicalGrid: !state.showTechnicalGrid })),
  highContrastSignals: false,
  toggleHighContrastSignals: () => set((state) => ({ highContrastSignals: !state.highContrastSignals })),

  isQuickRunModalOpen: false,
  setQuickRunModalOpen: (open) => set({ isQuickRunModalOpen: open }),

  // Real Backend Integration (Phase 5)
  simulationState: {
    status: 'idle',
    dataSource: 'demo',
    error: null,
    validationErrors: null,
    lastRunResponse: null,
    activeAlgorithmName: 'Deterministic Demo Baseline',
    numPoints: 80,
    randomSeed: 42,
    trajectoryType: 'closed_loop',
    nlosRate: 0.10,
    selectedBackendSolver: 'robust_nls',
  },
  setSimulationParam: (params) =>
    set((state) => ({
      simulationState: { ...state.simulationState, ...params },
    })),
  setSimulationConfig: (params) =>
    set((state) => ({
      simulationState: { ...state.simulationState, ...params },
    })),

  runBackendSimulation: async () => {
    if (get().simulationState.status === 'loading') return;
    const reqSeq = ++simRequestSeq;
    const { activeScenario, simulationState } = get();
    set((state) => ({
      simulationState: { ...state.simulationState, status: 'loading', error: null, validationErrors: null },
    }));

    try {
      const response = await apiClient.runSimulation({
        trajectory_type: simulationState.trajectoryType,
        num_points: simulationState.numPoints,
        sampling_interval: 0.25,
        noise_std_dev: activeScenario.noiseStdDevMeters,
        dropout_rate: activeScenario.dropoutRate,
        outlier_rate: 0.02,
        outlier_magnitude: 5.0,
        nlos_bias_mean: activeScenario.multipathBiasMeanMeters,
        nlos_rate: simulationState.nlosRate,
        target_z: 1.1,
        solver: simulationState.selectedBackendSolver,
        seed: simulationState.randomSeed,
        room: {
          width: activeScenario.room.width,
          length: activeScenario.room.length,
          height: activeScenario.room.height,
        },
        anchors: activeScenario.anchors.map((a) => ({
          id: a.id,
          x: a.x,
          y: a.y,
          z: a.z ?? 2.8,
          is_active: a.isActive,
        })),
      });

      if (reqSeq !== simRequestSeq) return; // Discard stale response

      const mappedTrajectory = mapSimulationToTrajectoryPoints(response);
      set((state) => ({
        trajectory: mappedTrajectory,
        playbackIndex: 0,
        simulationState: {
          ...state.simulationState,
          status: 'success',
          dataSource: 'backend',
          error: null,
          validationErrors: null,
          lastRunResponse: response,
          activeAlgorithmName: response.algorithm_name,
        },
        systemHealth: {
          ...state.systemHealth,
          totalEstimationsComputed: state.systemHealth.totalEstimationsComputed + response.num_points,
          lastHeartbeat: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err: unknown) {
      if (reqSeq !== simRequestSeq) return; // Discard stale response error
      const errorMsg = (err as Error)?.message || 'Positioning simulation failed';
      const validationErrs = (err as { errors?: string[] })?.errors || null;
      set((state) => ({
        simulationState: {
          ...state.simulationState,
          status: 'error',
          error: errorMsg,
          validationErrors: validationErrs,
        },
      }));
    }
  },

  resetToDemoTrajectory: () =>
    set((state) => ({
      trajectory: initialTrajectory,
      playbackIndex: 0,
      simulationState: {
        ...state.simulationState,
        status: 'idle',
        dataSource: 'demo',
        error: null,
        validationErrors: null,
        activeAlgorithmName: 'Deterministic Demo Baseline',
      },
    })),

  benchmarkState: {
    status: 'idle',
    dataSource: 'demo',
    error: null,
    lastCompareResponse: null,
  },

  runBackendBenchmark: async () => {
    if (get().benchmarkState.status === 'loading') return;
    const reqSeq = ++benchRequestSeq;
    const { activeScenario, simulationState } = get();
    set((state) => ({
      benchmarkState: { ...state.benchmarkState, status: 'loading', error: null },
    }));

    try {
      const response = await apiClient.compareSimulations({
        trajectory_type: simulationState.trajectoryType,
        num_points: Math.min(simulationState.numPoints, 120),
        sampling_interval: 0.25,
        noise_std_dev: activeScenario.noiseStdDevMeters,
        dropout_rate: activeScenario.dropoutRate,
        nlos_bias_mean: activeScenario.multipathBiasMeanMeters,
        nlos_rate: simulationState.nlosRate,
        target_z: 1.1,
        enable_kalman: true,
        robust_loss: 'huber',
        robust_f_scale: 0.5,
        seed: simulationState.randomSeed,
        room: {
          width: activeScenario.room.width,
          length: activeScenario.room.length,
          height: activeScenario.room.height,
        },
        anchors: activeScenario.anchors.map((a) => ({
          id: a.id,
          x: a.x,
          y: a.y,
          z: a.z ?? 2.8,
          is_active: a.isActive,
        })),
      });

      if (reqSeq !== benchRequestSeq) return; // Discard stale benchmark response

      set((state) => ({
        benchmarkState: {
          ...state.benchmarkState,
          status: 'success',
          dataSource: 'backend',
          error: null,
          lastCompareResponse: response,
        },
        systemHealth: {
          ...state.systemHealth,
          lastHeartbeat: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err: unknown) {
      if (reqSeq !== benchRequestSeq) return; // Discard stale benchmark error
      set((state) => ({
        benchmarkState: {
          ...state.benchmarkState,
          status: 'error',
          error: (err as Error)?.message || 'Benchmark comparison failed',
        },
      }));
    }
  },

  syncBackendConfig: async () => {
    try {
      const cfg = await apiClient.fetchDefaultConfig();
      set((state) => ({
        engineStatus: 'online',
        systemHealth: {
          ...state.systemHealth,
          engineStatus: 'online',
          lastHeartbeat: new Date().toLocaleTimeString(),
        },
        activeScenario: {
          ...state.activeScenario,
          room: {
            ...state.activeScenario.room,
            width: cfg.room.width,
            length: cfg.room.length,
            height: cfg.room.height,
          },
          anchors: cfg.anchors.map((backendA) => {
            const existing = state.activeScenario.anchors.find((a) => a.id === backendA.id);
            return {
              id: backendA.id,
              name: existing?.name || `Anchor ${backendA.id}`,
              x: backendA.x,
              y: backendA.y,
              z: backendA.z,
              isActive: backendA.is_active,
              status: existing?.status || 'healthy',
              nlosProb: existing?.nlosProb || 0.1,
            };
          }),
        },
      }));
    } catch {
      set((state) => ({
        engineStatus: 'offline',
        systemHealth: {
          ...state.systemHealth,
          engineStatus: 'offline',
        },
      }));
    }
  },
}));
