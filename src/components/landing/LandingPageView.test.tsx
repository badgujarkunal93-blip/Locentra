import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LandingPageView } from './LandingPageView';

// Mock Canvas from @react-three/fiber for JSDOM test runner
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="r3f-canvas-mock">{children}</div>
    ),
    useFrame: vi.fn(),
    useThree: () => ({
      camera: { position: { set: vi.fn(), lerp: vi.fn() } },
    }),
  };
});

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Billboard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe('Locentra Enterprise Landing Page', () => {
  it('renders light-themed navigation bar with brand name and CTA button', () => {
    render(<LandingPageView />);
    
    // Header brand
    const brands = screen.getAllByText('LOCENTRA');
    expect(brands.length).toBeGreaterThanOrEqual(1);

    // Navigation options
    expect(screen.getByRole('button', { name: /Platform & Tech/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Solutions & Use Cases/i })).toBeInTheDocument();

    // Right CTA Button
    const launchButtons = screen.getAllByText(/Launch Locentra Engine/i);
    expect(launchButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Section 1 Hero with side-by-side layout and editorial headline', () => {
    render(<LandingPageView />);
    
    // Hero headline (right side)
    expect(screen.getByText(/Sub-Meter Indoor Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Where GPS Dies/i)).toBeInTheDocument();
    const nlosMatches = screen.getAllByText(/NLOS resilience/i);
    expect(nlosMatches.length).toBeGreaterThanOrEqual(1);
    const outlierMatches = screen.getAllByText(/real-time outlier suppression/i);
    expect(outlierMatches.length).toBeGreaterThanOrEqual(1);

    // Metrics strip
    expect(screen.getAllByText(/< 0\.28m/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/714 Hz/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/0-Leakage/i).length).toBeGreaterThanOrEqual(1);

    // Interactive 3D Sandbox label (left side)
    expect(screen.getByText(/Interactive 3D Engine Sandbox/i)).toBeInTheDocument();
  });

  it('renders Section 2 Architecture tabs and switches between modules', () => {
    render(<LandingPageView />);

    expect(screen.getByText(/Built for High-Interference/i)).toBeInTheDocument();
    
    // Tab buttons
    const tab1 = screen.getByRole('button', { name: /1\. Outlier Suppression/i });
    const tab2 = screen.getByRole('button', { name: /2\. Blackout Survival/i });
    const tab3 = screen.getByRole('button', { name: /3\. Matrix Health/i });
    const tab4 = screen.getByRole('button', { name: /4\. Zero-Leakage/i });

    expect(tab1).toBeInTheDocument();
    expect(tab2).toBeInTheDocument();
    expect(tab3).toBeInTheDocument();
    expect(tab4).toBeInTheDocument();

    // Tab 1 Default Content: Huber Loss
    expect(screen.getByText(/Huber Loss vs\. Classical Ordinary Least Squares/i)).toBeInTheDocument();

    // Click Tab 2: Kalman
    fireEvent.click(tab2);
    expect(screen.getByText(/Continuous State Propagation Across Packet Dropouts/i)).toBeInTheDocument();

    // Click Tab 3: Jacobian
    fireEvent.click(tab3);
    expect(screen.getByText(/Jacobian Condition Number Monitoring/i)).toBeInTheDocument();

    // Click Tab 4: Leakage
    fireEvent.click(tab4);
    expect(screen.getByText(/Zero-Leakage Trajectory Benchmarking/i)).toBeInTheDocument();
  });

  it('renders Section 3 3D Scrollytelling zone triggers', () => {
    render(<LandingPageView />);

    expect(screen.getByText(/Explore 3 Critical Failure Modes in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Multipath Suppression/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kinematic Survival/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Jacobian DOP Health/i })).toBeInTheDocument();
  });

  it('renders Section 4 Locentra Algorithmic Superpowers showcase (replaces comparison table)', () => {
    render(<LandingPageView />);

    // Uniqueness section heading
    expect(screen.getByText(/Engineered for Extremes/i)).toBeInTheDocument();

    // Feature cards - titles
    expect(screen.getAllByText(/Adaptive Huber Outlier Clamping/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Kinematic Blackout Bridging/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Universal Protocol Agnosticism/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Sub-1\.5ms Real-Time Engine/i).length).toBeGreaterThanOrEqual(1);

    // Bottom CTA
    expect(screen.getByRole('button', { name: /Launch Engine Dashboard/i })).toBeInTheDocument();
  });

  it('renders Section 5 Contact form and triggers access submission', () => {
    render(<LandingPageView />);

    expect(screen.getByText(/Deploy Locentra on Your/i)).toBeInTheDocument();
    expect(screen.getByText('contact@locentra.ai')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/Dr\. Eleanor Vance/i);
    const emailInput = screen.getByPlaceholderText(/e\.vance@robotics-fleet\.com/i);
    const submitBtn = screen.getByRole('button', { name: /Request Access & Sandbox Keys/i });

    fireEvent.change(nameInput, { target: { value: 'Dr. Jane Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@enterprise.com' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Generating Evaluation Keys/i)).toBeInTheDocument();
  });

  it('renders Section 6 Professional Enterprise Footer with light theme', () => {
    render(<LandingPageView />);

    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Solutions')).toBeInTheDocument();
    expect(screen.getByText('Research & Papers')).toBeInTheDocument();
    expect(screen.getByText('Company & Trust')).toBeInTheDocument();
    expect(screen.getByText(/© 2026 Locentra Technologies Inc/i)).toBeInTheDocument();
    expect(screen.getByText(/System Status: 100% Operational/i)).toBeInTheDocument();

    // Footer legal links open LegalModal
    expect(screen.getByRole('button', { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Terms of Service/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cookie Preferences/i })).toBeInTheDocument();
  });

  it('opens LegalModal when Privacy Policy button in footer is clicked', () => {
    render(<LandingPageView />);

    // Find the footer Privacy Policy button specifically
    const privacyButtons = screen.getAllByRole('button', { name: /Privacy Policy/i });
    // Click any one of them
    fireEvent.click(privacyButtons[0]);

    // Modal content should appear
    expect(screen.getByText(/LOCENTRA LEGAL & COMPLIANCE/i)).toBeInTheDocument();
  });
});
