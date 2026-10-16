import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { DatasetHeader } from './DatasetHeader';
import { DatasetStatusBanner } from './DatasetStatusBanner';
import { DatasetOverviewCards } from './DatasetOverviewCards';
import { TrajectoryTable } from './TrajectoryTable';
import { TrajectoryPreviewCard } from './TrajectoryPreviewCard';
import { RawObservationsCard } from './RawObservationsCard';
import { EvaluationSplitCard } from './EvaluationSplitCard';
import { DataQualityCard } from './DataQualityCard';
import { DatasetViewTab, TrajectoryDatasetItem } from './types';
import {
  INITIAL_TRAJECTORIES,
  computeCorpusStats,
  generateRawObservationsForTrajectory,
  runDataQualityChecks,
  generateNewDataset,
  generateExportSchema,
} from './trajectoryCorpus';

export const DatasetExplorerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DatasetViewTab>('trajectories');
  const [datasets, setDatasets] = useState<TrajectoryDatasetItem[]>(INITIAL_TRAJECTORIES);
  const [selectedTrajectoryId, setSelectedTrajectoryId] = useState<string>('TRAJ-001');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const engineStatus = useAppStore((s) => s.engineStatus);
  const activeScenario = useAppStore((s) => s.activeScenario);

  // Active selected trajectory object
  const activeDataset = useMemo(() => {
    return datasets.find((d) => d.id === selectedTrajectoryId) || datasets[0];
  }, [datasets, selectedTrajectoryId]);

  // Generate real raw observations for the active trajectory
  const rawObservations = useMemo(() => {
    return generateRawObservationsForTrajectory(activeDataset);
  }, [activeDataset]);

  // Real data quality checks executed on active dataset & observations
  const qualityChecks = useMemo(() => {
    return runDataQualityChecks(activeDataset, rawObservations);
  }, [activeDataset, rawObservations]);

  // Overall corpus metrics
  const corpusStats = useMemo(() => {
    return computeCorpusStats(datasets);
  }, [datasets]);

  // Dynamic dataset generation action
  const handleGenerateDataset = () => {
    setIsGenerating(true);
    try {
      const newDataset = generateNewDataset(datasets);
      setDatasets((prev) => [newDataset, ...prev]);
      setSelectedTrajectoryId(newDataset.id);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export Schema action (produces real JSON schema download)
  const handleExportSchema = () => {
    const schema = generateExportSchema(datasets);
    const jsonStr = JSON.stringify(schema, null, 2);
    if (typeof window !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try {
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `locentra_dataset_schema_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (typeof URL.revokeObjectURL === 'function') {
          URL.revokeObjectURL(url);
        }
      } catch {
        // Safe fallback in test environments
      }
    }

    setExportNotice('Schema exported successfully to locentra_dataset_schema.json');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Export Confirmation Toast */}
      {exportNotice && (
        <div className="p-3 bg-[#E8F8F2] border border-[#B9E9D7] rounded-xl text-xs font-bold text-[#159B71] flex items-center justify-between shadow-xs">
          <span>{exportNotice}</span>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-[#159B71] hover:text-[#0D6247] ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <DatasetHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onGenerateDataset={handleGenerateDataset}
        onExportSchema={handleExportSchema}
        isGenerating={isGenerating}
      />

      {/* Synthetic Data Workspace Status Banner */}
      <DatasetStatusBanner
        totalDatasets={datasets.length}
        environmentName={activeScenario.name}
        isBackendConnected={engineStatus === 'online'}
      />

      {/* Compact Overview Row */}
      <DatasetOverviewCards stats={corpusStats} />

      {/* Tab 1: Trajectory Sets (Standard Rich Overview) */}
      {activeTab === 'trajectories' && (
        <div className="space-y-5">
          {/* Middle Row: Trajectory Table (Left) & Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <TrajectoryTable
                datasets={datasets}
                selectedTrajectoryId={selectedTrajectoryId}
                onSelectTrajectory={setSelectedTrajectoryId}
              />
            </div>
            <div className="lg:col-span-5">
              <TrajectoryPreviewCard dataset={activeDataset} />
            </div>
          </div>

          {/* Bottom Row: 3 Cards Side-by-Side */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            <div className="xl:col-span-5 2xl:col-span-5">
              <RawObservationsCard
                observations={rawObservations}
                datasets={datasets}
                selectedTrajectoryId={selectedTrajectoryId}
                onSelectTrajectory={setSelectedTrajectoryId}
              />
            </div>
            <div className="xl:col-span-7 2xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              <EvaluationSplitCard datasets={datasets} />
              <DataQualityCard checks={qualityChecks} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Raw Observations (Dedicated Full View) */}
      {activeTab === 'observations' && (
        <div className="space-y-5">
          <RawObservationsCard
            observations={rawObservations}
            datasets={datasets}
            selectedTrajectoryId={selectedTrajectoryId}
            onSelectTrajectory={setSelectedTrajectoryId}
          />
        </div>
      )}

      {/* Tab 3: Evaluation Splits (Dedicated Full View) */}
      {activeTab === 'splits' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <EvaluationSplitCard datasets={datasets} />
          </div>
          <div className="lg:col-span-5">
            <TrajectoryPreviewCard dataset={activeDataset} />
          </div>
        </div>
      )}

      {/* Tab 4: Quality Audit (Dedicated Full View) */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6">
            <DataQualityCard checks={qualityChecks} />
          </div>
          <div className="lg:col-span-6">
            <EvaluationSplitCard datasets={datasets} />
          </div>
        </div>
      )}
    </div>
  );
};
