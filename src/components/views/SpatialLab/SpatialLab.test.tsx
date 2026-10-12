import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpatialLabView } from './SpatialLabView';
import { useAppStore } from '../../../store/useAppStore';

describe('Spatial Lab Interactive 2D/3D Environment (Phase 2)', () => {
  beforeEach(() => {
    useAppStore.setState({
      spatialViewMode: '2d',
      isPlaying: false,
      playbackIndex: 0,
      selectedAnchorId: 'A1',
      showGroundTruth: true,
      showEstimated: true,
      showAnchorLabels: true,
      showRangeRays: true,
    });
  });

  it('renders Spatial Lab header, toolbar, 2D floor plan, and anchor inspector', () => {
    render(<SpatialLabView />);

    expect(screen.getByText('Spatial Lab & Localisation Visualiser')).toBeInTheDocument();
    expect(screen.getByText('Phase 2 Live')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /2D Floor Plan/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /3D Spatial Mesh/i })).toBeInTheDocument();
    expect(screen.getByText(/Spatial Symbology Legend/i)).toBeInTheDocument();
    expect(screen.getByText(/Anchor Nodes/i)).toBeInTheDocument();
  });

  it('displays anchors A1 to A6 and allows selecting a different anchor node', () => {
    render(<SpatialLabView />);

    // Check all anchor buttons exist in inspector
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].forEach((id) => {
      expect(screen.getByRole('button', { name: new RegExp(`^${id}$`) })).toBeInTheDocument();
    });

    // Select anchor A3
    const a3Btn = screen.getByRole('button', { name: /^A3$/ });
    fireEvent.click(a3Btn);

    expect(useAppStore.getState().selectedAnchorId).toBe('A3');
    expect(screen.getByText(/Anchor #3/i)).toBeInTheDocument();
  });

  it('allows toggling anchor active/inactive state and updates shared scenario', () => {
    render(<SpatialLabView />);

    // Initial state: A1 is active
    expect(screen.getByRole('button', { name: /Deactivate/i })).toBeInTheDocument();

    // Click Deactivate
    const deactivateBtn = screen.getByRole('button', { name: /Deactivate/i });
    fireEvent.click(deactivateBtn);

    // Anchor A1 should now be inactive
    const a1 = useAppStore.getState().activeScenario.anchors.find((a) => a.id === 'A1');
    expect(a1?.isActive).toBe(false);

    // Button changes to "Activate Node"
    expect(screen.getByRole('button', { name: /Activate Node/i })).toBeInTheDocument();

    // Reactivate
    const activateBtn = screen.getByRole('button', { name: /Activate Node/i });
    fireEvent.click(activateBtn);
    expect(useAppStore.getState().activeScenario.anchors.find((a) => a.id === 'A1')?.isActive).toBe(true);
  });

  it('toggles between 2D floor plan and 3D spatial mesh without losing state', () => {
    render(<SpatialLabView />);

    // Select A4 and set index to 10
    useAppStore.setState({ selectedAnchorId: 'A4', playbackIndex: 10 });

    // Switch to 3D
    const btn3D = screen.getByRole('tab', { name: /3D Spatial Mesh/i });
    fireEvent.click(btn3D);

    expect(useAppStore.getState().spatialViewMode).toBe('3d');
    expect(useAppStore.getState().selectedAnchorId).toBe('A4');
    expect(useAppStore.getState().playbackIndex).toBe(10);

    // Switch back to 2D
    const btn2D = screen.getByRole('tab', { name: /2D Floor Plan/i });
    fireEvent.click(btn2D);

    expect(useAppStore.getState().spatialViewMode).toBe('2d');
    expect(useAppStore.getState().selectedAnchorId).toBe('A4');
  });

  it('controls playback: play, pause, step forward, and reset', () => {
    render(<SpatialLabView />);

    // Play/Pause button
    const playBtn = screen.getByRole('button', { name: /Play trajectory playback/i });
    fireEvent.click(playBtn);
    expect(useAppStore.getState().isPlaying).toBe(true);

    const pauseBtn = screen.getByRole('button', { name: /Pause trajectory playback/i });
    fireEvent.click(pauseBtn);
    expect(useAppStore.getState().isPlaying).toBe(false);

    // Step forward
    const stepBtn = screen.getByRole('button', { name: /Step forward 1 frame/i });
    fireEvent.click(stepBtn);
    expect(useAppStore.getState().playbackIndex).toBe(1);

    // Reset playback
    const resetBtn = screen.getByRole('button', { name: /Reset trajectory playback/i });
    fireEvent.click(resetBtn);
    expect(useAppStore.getState().playbackIndex).toBe(0);
  });

  it('toggles visibility layers for paths, rays, and labels', () => {
    render(<SpatialLabView />);

    const gtBtn = screen.getByRole('button', { name: /GT Path/i });
    fireEvent.click(gtBtn);
    expect(useAppStore.getState().showGroundTruth).toBe(false);

    const estBtn = screen.getByRole('button', { name: /Est Path/i });
    fireEvent.click(estBtn);
    expect(useAppStore.getState().showEstimated).toBe(false);

    const raysBtn = screen.getByRole('button', { name: /Rays/i });
    fireEvent.click(raysBtn);
    expect(useAppStore.getState().showRangeRays).toBe(false);

    const labelsBtn = screen.getByRole('button', { name: /Labels/i });
    fireEvent.click(labelsBtn);
    expect(useAppStore.getState().showAnchorLabels).toBe(false);
  });
});
