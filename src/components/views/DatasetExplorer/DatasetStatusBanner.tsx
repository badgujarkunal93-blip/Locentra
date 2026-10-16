import React from 'react';
import { Database, Info } from 'lucide-react';

interface DatasetStatusBannerProps {
  totalDatasets: number;
  environmentName: string;
  isBackendConnected: boolean;
}

export const DatasetStatusBanner: React.FC<DatasetStatusBannerProps> = ({
  totalDatasets,
  environmentName,
}) => {
  return (
    <div className="rounded-2xl p-4 border border-[#E5E5E9] bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F0ECFC] text-[#8B6CF6] flex items-center justify-center shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-[#171719] font-bold text-sm">Synthetic Data Workspace</strong>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F2] text-[#159B71]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#159B71]" />
              Ready ({totalDatasets} Sets)
            </span>
          </div>
          <p className="text-[#74747B] text-[11px] mt-0.5">
            Synthetic trajectories generated with kinematic motion models, stochastic channel noise, and {environmentName} geometry.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FEF6E9] text-[#F5AC35] border border-[#FDE68A]">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Generated data — not physical sensor readings</span>
        </div>
      </div>
    </div>
  );
};
