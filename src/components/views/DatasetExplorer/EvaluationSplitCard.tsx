import React from 'react';
import { PieChart, CheckCircle2 } from 'lucide-react';
import { TrajectoryDatasetItem } from './types';
import { runLeakageAuditRules } from './trajectoryCorpus';

interface EvaluationSplitCardProps {
  datasets: TrajectoryDatasetItem[];
}

export const EvaluationSplitCard: React.FC<EvaluationSplitCardProps> = ({ datasets }) => {
  const trainDatasets = datasets.filter((d) => d.split === 'train');
  const valDatasets = datasets.filter((d) => d.split === 'validation');
  const testDatasets = datasets.filter((d) => d.split === 'test');

  const total = datasets.length || 1;
  const trainPct = Math.round((trainDatasets.length / total) * 100);
  const valPct = Math.round((valDatasets.length / total) * 100);
  const testPct = Math.round((testDatasets.length / total) * 100);

  const leakageChecks = runLeakageAuditRules(datasets);
  const allPassed = leakageChecks.every((c) => c.passed);

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F8F2] text-[#159B71] flex items-center justify-center shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171719] tracking-tight">
                Evaluation Split Integrity
              </h2>
              <p className="text-xs text-[#74747B]">
                Verify that trajectories are correctly isolated between splits.
              </p>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              allPassed ? 'bg-[#E8F8F2] text-[#159B71]' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {allPassed ? 'All checks passed' : 'Audit warnings'}
          </span>
        </div>

        {/* Visual Split Distribution Bar */}
        <div className="mt-4 mb-3">
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-[#E8E8EE]">
            <div
              className="bg-[#159B71] h-full flex items-center justify-center text-[9px] font-bold text-white transition-all"
              style={{ width: `${trainPct}%` }}
            >
              {trainPct}%
            </div>
            <div
              className="bg-[#268BFF] h-full flex items-center justify-center text-[9px] font-bold text-white transition-all"
              style={{ width: `${valPct}%` }}
            >
              {valPct}%
            </div>
            <div
              className="bg-[#8B6CF6] h-full flex items-center justify-center text-[9px] font-bold text-white transition-all"
              style={{ width: `${testPct}%` }}
            >
              {testPct}%
            </div>
          </div>

          {/* Partition Metadata */}
          <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] min-w-0">
              <div className="font-bold text-[#159B71] truncate">{trainPct}% Train</div>
              <div className="text-[10px] text-[#74747B] truncate">{trainDatasets.length} trajectories</div>
            </div>
            <div className="p-2 rounded-xl bg-[#F0F9FF] border border-[#E0F2FE] min-w-0">
              <div className="font-bold text-[#268BFF] truncate">{valPct}% Validation</div>
              <div className="text-[10px] text-[#74747B] truncate">{valDatasets.length} trajectories</div>
            </div>
            <div className="p-2 rounded-xl bg-[#FAF5FF] border border-[#F3E8FF] min-w-0">
              <div className="font-bold text-[#8B6CF6] truncate">{testPct}% Test</div>
              <div className="text-[10px] text-[#74747B] truncate">{testDatasets.length} trajectories</div>
            </div>
          </div>
        </div>

        {/* Anti-Leakage Architecture Rules & Audit Checks */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[#171719] uppercase tracking-wider">
              Anti-Leakage Architecture Rules
            </h3>
            <span className="text-[10px] font-normal text-[#159B71] lowercase font-mono shrink-0">
              [leakage audit checks]
            </span>
          </div>

          <div className="space-y-2">
            {leakageChecks.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-2 text-xs text-[#171719]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#159B71] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-[#171719] block">{check.name}</span>
                  <p className="text-[10px] text-[#74747B] leading-tight mt-0.5">{check.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#F0F0F3] text-[10px] text-[#74747B] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span>Synthetic partition: Isolated RNG seeds ensure zero waypoint overlap between splits</span>
        <span className="font-mono text-[#171719] font-bold">Held-out testing sequence</span>
      </div>
    </div>
  );
};
