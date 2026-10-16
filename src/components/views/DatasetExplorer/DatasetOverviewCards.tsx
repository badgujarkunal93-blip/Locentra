import React from 'react';
import { Layers, Radio, PieChart, ShieldCheck } from 'lucide-react';
import { DatasetCorpusStats } from './types';

interface DatasetOverviewCardsProps {
  stats: DatasetCorpusStats;
}

export const DatasetOverviewCards: React.FC<DatasetOverviewCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Trajectory Sets */}
      <div className="bg-white rounded-[22px] border border-[#E5E5E9] p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#F0ECFC] text-[#8B6CF6] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#888890] uppercase tracking-wider">
            Trajectory Sets
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3 mb-1">
          <div>
            <div className="text-3xl font-extrabold text-[#171719] tracking-tight">
              {stats.totalDatasets}
            </div>
            <div className="text-xs text-[#74747B] mt-0.5">
              {stats.trainCount} train &middot; {stats.valCount} val &middot; {stats.testCount} test
            </div>
          </div>

          {/* Mini Sparkline Curve */}
          <svg className="w-16 h-7 text-[#8B6CF6]" viewBox="0 0 60 25" fill="none">
            <path
              d="M2 18C12 8 20 22 30 12C40 4 48 16 58 8"
              stroke="#8B6CF6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Raw Range Observations */}
      <div className="bg-white rounded-[22px] border border-[#E5E5E9] p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#E9F3FF] text-[#268BFF] flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#888890] uppercase tracking-wider">
            Raw Observations
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-3 mb-1">
          <div>
            <div className="text-3xl font-extrabold text-[#171719] tracking-tight">
              {stats.totalObservations.toLocaleString()}
            </div>
            <div className="text-xs text-[#74747B] mt-0.5">
              range measurements across 6 anchors
            </div>
          </div>

          {/* Mini Bar Histogram */}
          <div className="flex items-end gap-1 h-7">
            <span className="w-1.5 h-3 bg-[#BAE6FD] rounded-xs" />
            <span className="w-1.5 h-5 bg-[#7DD3FC] rounded-xs" />
            <span className="w-1.5 h-7 bg-[#268BFF] rounded-xs" />
            <span className="w-1.5 h-4 bg-[#7DD3FC] rounded-xs" />
            <span className="w-1.5 h-6 bg-[#38BDF8] rounded-xs" />
          </div>
        </div>
      </div>

      {/* 3. Evaluation Split */}
      <div className="bg-white rounded-[22px] border border-[#E5E5E9] p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#E8F8F2] text-[#159B71] flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#888890] uppercase tracking-wider">
            Evaluation Split
          </span>
        </div>

        <div className="mt-3 mb-1">
          <div className="text-2xl font-extrabold text-[#171719] tracking-tight font-mono">
            {stats.trainPercent}% / {stats.valPercent}% / {stats.testPercent}%
          </div>
          <div className="text-xs text-[#74747B] mt-0.5">
            train / validation / test partition
          </div>

          {/* 3-Color Segmented Progress Bar */}
          <div className="flex h-2 w-full rounded-full overflow-hidden mt-2.5 bg-[#E8E8EE]">
            <div
              className="bg-[#159B71] h-full"
              style={{ width: `${stats.trainPercent}%` }}
              title={`Train: ${stats.trainPercent}%`}
            />
            <div
              className="bg-[#268BFF] h-full"
              style={{ width: `${stats.valPercent}%` }}
              title={`Validation: ${stats.valPercent}%`}
            />
            <div
              className="bg-[#8B6CF6] h-full"
              style={{ width: `${stats.testPercent}%` }}
              title={`Test: ${stats.testPercent}%`}
            />
          </div>
        </div>
      </div>

      {/* 4. Data Quality */}
      <div className="bg-white rounded-[22px] border border-[#E5E5E9] p-5 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-[#FEF6E9] text-[#F5AC35] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-[#888890] uppercase tracking-wider">
            Data Quality
          </span>
        </div>

        <div className="mt-3 mb-1">
          <div className="text-3xl font-extrabold text-[#171719] tracking-tight">
            {stats.qualityPassRate}%
          </div>
          <div className="text-xs text-[#74747B] mt-0.5">
            passed mathematical validation checks
          </div>

          <div className="w-full bg-[#E8E8EE] h-2 rounded-full overflow-hidden mt-2.5">
            <div
              className="bg-[#159B71] h-full rounded-full"
              style={{ width: `${stats.qualityPassRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
