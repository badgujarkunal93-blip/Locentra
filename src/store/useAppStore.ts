import { create } from 'zustand';
import { NavigationSectionId } from '../types/navigation';
import { EngineStatus, SystemHealthState } from '../types/telemetry';
import { ScenarioConfiguration, SpatialViewMode, TrajectoryPoint } from '../types/scenario';
import { generateDemonstrationTrajectory } from '../components/views/SpatialLab/trajectoryUtils';

interface AppState {
  // Navigation
  activeSection: NavigationSectionId;
  setActiveSection: (section: NavigationSectionId) => void;

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
}

const initialTrajectory = generateDemonstrationTrajectory(80);

export const useAppStore = create<AppState>((set) => ({
  activeSection: 'command-center',
  setActiveSection: (section) => set({ activeSection: section }),

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
    set((state) => ({
      playbackIndex: (state.playbackIndex + 1) % state.trajectory.length,
    })),
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
}));
