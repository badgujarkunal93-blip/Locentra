import React from 'react';
import { Plus, Download, Loader2 } from 'lucide-react';
import { DatasetViewTab } from './types';

interface DatasetHeaderProps {
  activeTab: DatasetViewTab;
  onTabChange: (tab: DatasetViewTab) => void;
  onGenerateDataset: () => void;
  onExportSchema: () => void;
  isGenerating?: boolean;
}

export const DatasetHeader: React.FC<DatasetHeaderProps> = ({
  activeTab,
  onTabChange,
  onGenerateDataset,
  onExportSchema,
  isGenerating = false,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold tracking-widest text-[#74747B] uppercase bg-[#EAEAEA] px-2 py-0.5 rounded-md">
            Data Repository
          </span>
          <span className="text-[10px] text-[#888890] font-mono">
            Locentra Vault v0.1.0-alpha
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171719] tracking-tight">
          Dataset Explorer &amp; Trajectory Vault
        </h1>
        <p className="text-xs sm:text-sm text-[#74747B] mt-1 max-w-2xl">
          Explore reproducible trajectories, raw range observations, and leakage-safe evaluation splits.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* View Tabs */}
        <div className="inline-flex items-center bg-white p-1 rounded-xl border border-[#E5E5E9] shadow-sm">
          <button
            type="button"
            onClick={() => onTabChange('trajectories')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'trajectories'
                ? 'bg-[#D9F56F] text-[#171719] shadow-sm font-bold'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Trajectory Sets
          </button>
          <button
            type="button"
            onClick={() => onTabChange('observations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'observations'
                ? 'bg-[#D9F56F] text-[#171719] shadow-sm font-bold'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Raw Observations
          </button>
          <button
            type="button"
            onClick={() => onTabChange('splits')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'splits'
                ? 'bg-[#D9F56F] text-[#171719] shadow-sm font-bold'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Evaluation Splits
          </button>
          <button
            type="button"
            onClick={() => onTabChange('audit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-[#D9F56F] text-[#171719] shadow-sm font-bold'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Quality Audit
          </button>
        </div>

        {/* Generate Dataset Action */}
        <button
          type="button"
          onClick={onGenerateDataset}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D9F56F] hover:bg-[#cbf056] text-[#171719] font-bold text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#171719]" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Generate Dataset</span>
            </>
          )}
        </button>

        {/* Export Schema Action */}
        <button
          type="button"
          onClick={onExportSchema}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-[#171719] font-bold text-xs border border-[#E5E5E9] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#555555]" />
          <span>Export Schema</span>
        </button>
      </div>
    </div>
  );
};
