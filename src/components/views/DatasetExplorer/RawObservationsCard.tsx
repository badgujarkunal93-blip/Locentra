import React, { useState, useMemo } from 'react';
import { Radio, Download, ChevronDown } from 'lucide-react';
import { RawRangeObservation, TrajectoryDatasetItem } from './types';
import { CANONICAL_ANCHORS } from './trajectoryCorpus';

interface RawObservationsCardProps {
  observations: RawRangeObservation[];
  datasets: TrajectoryDatasetItem[];
  selectedTrajectoryId: string;
  onSelectTrajectory: (id: string) => void;
  onExportCsv?: () => void;
}

export const RawObservationsCard: React.FC<RawObservationsCardProps> = ({
  observations,
  datasets,
  selectedTrajectoryId,
  onSelectTrajectory,
  onExportCsv,
}) => {
  const [anchorFilter, setAnchorFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 8;

  const filteredObservations = useMemo(() => {
    return observations.filter((obs) => {
      if (anchorFilter !== 'all' && obs.anchorId !== anchorFilter) {
        return false;
      }
      return true;
    });
  }, [observations, anchorFilter]);

  const totalPages = Math.ceil(filteredObservations.length / rowsPerPage) || 1;
  const paginatedObs = filteredObservations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getObservationStateBadge = (state: RawRangeObservation['state']) => {
    switch (state) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F2] text-[#159B71]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#159B71]" />
            Valid
          </span>
        );
      case 'dropout':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3F4F6] text-[#6B7280]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
            Dropout
          </span>
        );
      case 'nlos':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            NLOS Bias
          </span>
        );
      case 'outlier':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#B91C1C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            Outlier
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F0F3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E9F3FF] text-[#268BFF] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171719] tracking-tight">
                Raw Range Observations
              </h2>
              <p className="text-xs text-[#74747B]">
                Synthetic range measurements from all anchors with controlled noise.
              </p>
            </div>
          </div>

          {/* Trajectory & Anchor Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={selectedTrajectoryId}
                onChange={(e) => {
                  onSelectTrajectory(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-[#F4F4F6] text-xs font-semibold text-[#171719] pl-3 pr-7 py-1.5 rounded-lg border border-[#E5E5E9] cursor-pointer focus:outline-none"
              >
                {datasets.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#74747B] absolute right-2 top-2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={anchorFilter}
                onChange={(e) => {
                  setAnchorFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-[#F4F4F6] text-xs font-semibold text-[#171719] pl-3 pr-7 py-1.5 rounded-lg border border-[#E5E5E9] cursor-pointer focus:outline-none"
              >
                <option value="all">All Anchors</option>
                {CANONICAL_ANCHORS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} ({a.name})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#74747B] absolute right-2 top-2 pointer-events-none" />
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF6E9] text-[#F5AC35] border border-[#FDE68A]">
              Synthetic Data
            </span>

            {onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                className="p-1.5 text-[#74747B] hover:text-[#171719] rounded-lg hover:bg-neutral-100 transition-colors"
                title="Export observation records"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Observations Table */}
        <div className="overflow-x-auto my-3">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#E5E5E9] text-[#74747B]">
                <th className="py-2 px-3">Timestamp (s)</th>
                <th className="py-2 px-3">Anchor ID</th>
                <th className="py-2 px-3 text-right">Measured Range (m)</th>
                <th className="py-2 px-3 text-right">Noise (m)</th>
                <th className="py-2 px-3 text-center">Observation State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F3] text-[#171719]">
              {paginatedObs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#74747B]">
                    No observations available for this filter.
                  </td>
                </tr>
              ) : (
                paginatedObs.map((obs) => (
                  <tr key={obs.id} className="hover:bg-[#F9F9FB]">
                    <td className="py-2.5 px-3 text-[#555555]">
                      {obs.timestampSec.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#171719]">
                      {obs.anchorId}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#171719]">
                      {obs.measuredRangeMeters !== null
                        ? `${obs.measuredRangeMeters.toFixed(3)} m`
                        : '— (Dropout)'}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right ${
                        obs.noiseMeters > 0.3 ? 'text-amber-600 font-bold' : 'text-[#74747B]'
                      }`}
                    >
                      {obs.noiseMeters >= 0 ? `+${obs.noiseMeters.toFixed(3)}` : obs.noiseMeters.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {getObservationStateBadge(obs.state)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="pt-2 border-t border-[#F0F0F3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#74747B] gap-2">
        <div>
          Showing {paginatedObs.length} of {filteredObservations.length} observations
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">Page {currentPage} of {totalPages}</span>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2 py-0.5 rounded text-[11px] border border-[#E5E5E9] disabled:opacity-40"
            >
              &lt;
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-0.5 rounded text-[11px] border border-[#E5E5E9] disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
