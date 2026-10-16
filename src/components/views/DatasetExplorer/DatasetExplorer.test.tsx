import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatasetExplorerView } from './DatasetExplorerView';
import {
  INITIAL_TRAJECTORIES,
  computeCorpusStats,
  generateRawObservationsForTrajectory,
  runDataQualityChecks,
  runLeakageAuditRules,
  generateNewDataset,
  generateExportSchema,
} from './trajectoryCorpus';

describe('Phase 6.6: Dataset Explorer & Trajectory Vault Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Corpus Mathematical Statistics & Synthetic Data Generation', () => {
    it('computes corpus statistics and partition percentages correctly', () => {
      const stats = computeCorpusStats(INITIAL_TRAJECTORIES);

      expect(stats.totalDatasets).toBe(12);
      expect(stats.trainCount + stats.valCount + stats.testCount).toBe(12);
      expect(stats.totalWaypoints).toBeGreaterThan(5000);
      expect(stats.totalObservations).toBe(stats.totalWaypoints * 6);
      expect(stats.trainPercent + stats.valPercent + stats.testPercent).toBeGreaterThanOrEqual(99);
    });

    it('generates raw range observations for all 6 anchors without NaN coordinates', () => {
      const traj = INITIAL_TRAJECTORIES[0];
      const observations = generateRawObservationsForTrajectory(traj);

      expect(observations.length).toBe(traj.points.length * 6);

      // Verify all anchors A1 to A6 are present
      const anchorIds = new Set(observations.map((o) => o.anchorId));
      expect(anchorIds.has('A1')).toBe(true);
      expect(anchorIds.has('A6')).toBe(true);

      // Verify true range is strictly positive and finite
      observations.forEach((o) => {
        expect(o.trueRangeMeters).toBeGreaterThan(0);
        expect(Number.isFinite(o.trueRangeMeters)).toBe(true);
      });
    });

    it('performs mathematical data quality checks on synthetic trajectory', () => {
      const traj = INITIAL_TRAJECTORIES[0];
      const observations = generateRawObservationsForTrajectory(traj);
      const checks = runDataQualityChecks(traj, observations);

      expect(checks).toHaveLength(7);
      const boundsCheck = checks.find((c) => c.id === 'bounds-check');
      expect(boundsCheck).toBeDefined();
      expect(boundsCheck!.status).toBe('passed');

      const negativeRangeCheck = checks.find((c) => c.id === 'negative-ranges');
      expect(negativeRangeCheck).toBeDefined();
      expect(negativeRangeCheck!.status).toBe('passed');
    });

    it('evaluates leakage audit checks ensuring disjoint seeds across splits', () => {
      const audit = runLeakageAuditRules(INITIAL_TRAJECTORIES);
      expect(audit).toHaveLength(5);
      expect(audit.every((rule) => rule.passed)).toBe(true);
    });

    it('generates a new synthetic trajectory with unique ID and valid points', () => {
      const newTraj = generateNewDataset(INITIAL_TRAJECTORIES);

      expect(newTraj.id).toBe('TRAJ-013');
      expect(newTraj.points.length).toBeGreaterThan(0);
      expect(newTraj.lengthMeters).toBeGreaterThan(0);
      expect(newTraj.seed).toBeGreaterThan(100);
    });

    it('generates canonical Parquet/JSON dataset export schema', () => {
      const schema = generateExportSchema(INITIAL_TRAJECTORIES);

      expect(schema.format).toContain('Locentra Synthetic');
      expect(schema.environment.anchors).toHaveLength(6);
      expect(schema.schema_definitions.trajectory_columns.length).toBeGreaterThan(0);
      expect(schema.datasets_summary).toHaveLength(12);
    });
  });

  describe('UI Rendering, Tab Navigation, and User Interactions', () => {
    it('renders header, status banner, overview cards, library table, and preview', () => {
      render(<DatasetExplorerView />);

      // Title & Subtitle
      expect(screen.getByText(/Dataset Explorer & Trajectory Vault/i)).toBeInTheDocument();
      expect(screen.getByText(/Explore reproducible trajectories, raw range observations/i)).toBeInTheDocument();

      // Navigation tabs
      expect(screen.getByRole('button', { name: /Trajectory Sets/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Raw Observations/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Evaluation Splits/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Quality Audit/i })).toBeInTheDocument();

      // Status banner & notice
      expect(screen.getByText(/Synthetic Data Workspace/i)).toBeInTheDocument();
      expect(screen.getByText(/Generated data — not physical sensor readings/i)).toBeInTheDocument();

      // 4 Overview Cards and Tabs
      expect(screen.getAllByText(/Trajectory Sets/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Raw Observations/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Evaluation Split/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Data Quality/i).length).toBeGreaterThan(0);

      // Trajectory Library and Preview
      expect(screen.getByText(/Trajectory Dataset Library/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Figure-Eight Smooth Sweep/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Trajectory Preview & Room Layout/i)).toBeInTheDocument();

      // Bottom cards
      expect(screen.getAllByText(/Raw Range Observations/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Evaluation Split Integrity/i)).toBeInTheDocument();
      expect(screen.getByText(/Anti-Leakage Architecture Rules/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Quality Checks/i)).toBeInTheDocument();
    });

    it('switches tabs to Raw Observations, Evaluation Splits, and Quality Audit', () => {
      render(<DatasetExplorerView />);

      // Switch to Raw Observations
      const obsTab = screen.getByRole('button', { name: /Raw Observations/i });
      fireEvent.click(obsTab);
      expect(screen.getByText(/Synthetic range measurements from all anchors/i)).toBeInTheDocument();

      // Switch to Evaluation Splits
      const splitsTab = screen.getByRole('button', { name: /Evaluation Splits/i });
      fireEvent.click(splitsTab);
      expect(screen.getByText(/Verify that trajectories are correctly isolated/i)).toBeInTheDocument();

      // Switch to Quality Audit
      const auditTab = screen.getByRole('button', { name: /Quality Audit/i });
      fireEvent.click(auditTab);
      expect(screen.getByText(/Automated validation of trajectory and range data/i)).toBeInTheDocument();
    });

    it('filters trajectories by search keyword in the library table', () => {
      render(<DatasetExplorerView />);

      const searchInput = screen.getByPlaceholderText(/Search trajectories.../i);
      fireEvent.change(searchInput, { target: { value: 'Corridor' } });

      expect(screen.getByText(/Corridor Perimeter Patrol/i)).toBeInTheDocument();
      // Notice: In the table, only TRAJ-002 is rendered
      expect(screen.getAllByText(/TRAJ-002/i).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Random Walk with Obstacles/i)).not.toBeInTheDocument();
    });

    it('selects a trajectory row and updates preview metadata', () => {
      render(<DatasetExplorerView />);

      // Click on TRAJ-002
      const traj2 = screen.getByText(/Corridor Perimeter Patrol/i);
      fireEvent.click(traj2);

      // Verify that metadata reflects TRAJ-002
      expect(screen.getAllByText(/TRAJ-002/i).length).toBeGreaterThan(0);
    });

    it('generates a new synthetic trajectory when clicking Generate Dataset', () => {
      render(<DatasetExplorerView />);

      const generateBtn = screen.getByRole('button', { name: /Generate Dataset/i });
      fireEvent.click(generateBtn);

      expect(screen.getAllByText(/TRAJ-013/i).length).toBeGreaterThan(0);
    });

    it('handles Export Schema action without throwing errors', () => {
      render(<DatasetExplorerView />);

      const exportBtn = screen.getByRole('button', { name: /Export Schema/i });
      fireEvent.click(exportBtn);

      expect(screen.getByText(/Schema exported successfully/i)).toBeInTheDocument();
    });
  });
});
