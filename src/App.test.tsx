import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';
import { useAppStore } from './store/useAppStore';

describe('Locentra Shell & Navigation', () => {
  beforeEach(() => {
    // Reset state before each test
    useAppStore.setState({
      activeSection: 'command-center',
      engineStatus: 'online',
    });
  });

  it('renders application brand, header, and primary navigation destinations', () => {
    render(<App />);
    const brandOccurrences = screen.getAllByText('Locentra');
    expect(brandOccurrences.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Spatial Intelligence')).toBeInTheDocument();
    
    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    expect(within(nav).getByRole('button', { name: /Command Center/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Spatial Lab/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Scenario Studio/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Benchmark Arena/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /Dataset Explorer/i })).toBeInTheDocument();
  });

  it('displays the Command Center with illustrative metrics and solvers by default', () => {
    render(<App />);
    expect(screen.getByText('Positioning Command Center')).toBeInTheDocument();
    expect(screen.getByText('Root Mean Squared Error')).toBeInTheDocument();
    expect(screen.getByText('0.28')).toBeInTheDocument();
    expect(screen.getByText('Phase 1 Prototype Shell & Design System')).toBeInTheDocument();
  });

  it('navigates to Spatial Lab and renders real 2D/3D localisation visualiser', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const spatialLabBtn = within(nav).getByRole('button', { name: /Spatial Lab/i });
    fireEvent.click(spatialLabBtn);

    expect(screen.getByText(/Spatial Lab & Localisation Visualiser/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /2D Floor Plan/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /3D Spatial Mesh/i })).toBeInTheDocument();
    expect(screen.getByText(/Phase 2 Live/i)).toBeInTheDocument();
  });

  it('navigates to Scenario Studio and displays degradation sliders', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const studioBtn = within(nav).getByRole('button', { name: /Scenario Studio/i });
    fireEvent.click(studioBtn);

    expect(screen.getByText(/Scenario Studio & Degradation Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Gaussian Range Noise/i)).toBeInTheDocument();
    expect(screen.getByText(/Intermittent Packet Dropout/i)).toBeInTheDocument();
  });

  it('navigates to Benchmark Arena and displays CDF error evaluation', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const benchmarkBtn = within(nav).getByRole('button', { name: /Benchmark Arena/i });
    fireEvent.click(benchmarkBtn);

    expect(screen.getByText(/Benchmark Arena & CDF Error Suite/i)).toBeInTheDocument();
    expect(screen.getByText(/Cumulative Distribution Function/i)).toBeInTheDocument();
    expect(screen.getByText(/Mock Benchmark/i)).toBeInTheDocument();
  });

  it('navigates to Dataset Explorer and shows trajectory corpus & anti-leakage rules', () => {
    render(<App />);
    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const datasetBtn = within(nav).getByRole('button', { name: /Dataset Explorer/i });
    fireEvent.click(datasetBtn);

    expect(screen.getByText(/Dataset Explorer & Trajectory Vault/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Figure-Eight Smooth Sweep/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Anti-Leakage Architecture Rules/i)).toBeInTheDocument();
  });
});
