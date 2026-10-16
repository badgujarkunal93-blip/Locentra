import React from 'react';
import { Layers, CheckSquare, Square, Zap } from 'lucide-react';
import { SolverDisplayMeta } from './types';

export interface SolverRowData {
  meta: SolverDisplayMeta;
  rmse: number | null;
  p95: number | null;
  validRate: number | null;
  runtimeSec: number | null;
  validCount: number | null;
  totalCount: number | null;
  isBestRmse: boolean;
  isBestP95: boolean;
}

interface SolverMatrixTableProps {
  rows: SolverRowData[];
  selectedSolverIds: string[];
  onToggleSolver: (solverId: string) => void;
  onSelectAll: () => void;
  onCompareSelected: () => void;
}

export const SolverMatrixTable: React.FC<SolverMatrixTableProps> = ({
  rows,
  selectedSolverIds,
  onToggleSolver,
  onSelectAll,
  onCompareSelected,
}) => {
  const allSelected = rows.length > 0 && rows.every((r) => selectedSolverIds.includes(r.meta.id));

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Optimization':
        return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
      case 'Filtering':
        return 'bg-[#F0ECFC] text-[#6D28D9] border-[#DDD6FE]';
      case 'Geometric':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      default:
        return 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]';
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F0F3]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F0ECFC] text-[#8B6CF6] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#171719] tracking-tight">
              Solver Comparison Matrix
            </h2>
            <p className="text-xs text-[#74747B]">
              Detailed performance metrics for each algorithm (latest run).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCompareSelected}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D9F56F] hover:bg-[#cbf056] text-[#171719] font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5 fill-[#171719]" />
          <span>Compare selected solvers</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto my-3">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E5E5E9] text-[#74747B] font-semibold">
              <th className="py-2.5 px-3 w-8 text-center">
                <button
                  type="button"
                  onClick={onSelectAll}
                  aria-label={allSelected ? 'Deselect all solvers' : 'Select all solvers'}
                  className="text-[#74747B] hover:text-[#171719] cursor-pointer"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#159B71]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3">Algorithm</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">RMSE (m)</th>
              <th className="py-2.5 px-3 text-right">P95 (m)</th>
              <th className="py-2.5 px-3 text-right">Valid rate</th>
              <th className="py-2.5 px-3 text-right">Run time (s)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F3] text-[#171719]">
            {rows.map((row) => {
              const isSelected = selectedSolverIds.includes(row.meta.id);

              return (
                <tr
                  key={row.meta.id}
                  className={`hover:bg-[#F9F9FB] transition-colors ${
                    isSelected ? 'bg-neutral-50/40' : 'opacity-70'
                  }`}
                >
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleSolver(row.meta.id)}
                      aria-label={`Toggle ${row.meta.name}`}
                      className="cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#159B71]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#A0A0A8]" />
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.meta.color }}
                      />
                      <span className="font-bold text-[#171719]">{row.meta.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                        row.meta.category
                      )}`}
                    >
                      {row.meta.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={`px-1.5 py-0.5 rounded-md font-bold ${
                        row.isBestRmse
                          ? 'bg-[#E8F8F2] text-[#159B71] border border-[#B9E9D7]'
                          : 'text-[#171719]'
                      }`}
                    >
                      {row.rmse !== null ? row.rmse.toFixed(2) : '—'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono">
                    <span className={row.isBestP95 ? 'text-[#159B71] font-bold' : 'text-[#74747B]'}>
                      {row.p95 !== null ? row.p95.toFixed(2) : '—'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold">
                    <span
                      className={
                        row.validRate !== null && row.validRate >= 0.95
                          ? 'text-[#159B71]'
                          : 'text-amber-600'
                      }
                    >
                      {row.validRate !== null ? `${(row.validRate * 100).toFixed(1)}%` : '—'}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-[#74747B]">
                    {row.runtimeSec !== null
                      ? row.runtimeSec.toFixed(2)
                      : row.validCount !== null && row.totalCount !== null
                      ? `${row.validCount}/${row.totalCount}`
                      : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#F0F0F3] flex items-center justify-between text-[11px] text-[#74747B]">
        <span>Best results highlighted by lowest RMSE &amp; highest valid estimation rate.</span>
        <span className="font-mono text-[#171719] font-medium">
          {selectedSolverIds.length} of {rows.length} active
        </span>
      </div>
    </div>
  );
};
