import React, { useState, useMemo } from 'react';
import { Database, Search, ChevronDown, Eye, MoreVertical, CheckSquare, Square } from 'lucide-react';
import { TrajectoryDatasetItem, SplitType } from './types';

interface TrajectoryTableProps {
  datasets: TrajectoryDatasetItem[];
  selectedTrajectoryId: string;
  onSelectTrajectory: (id: string) => void;
}

export const TrajectoryTable: React.FC<TrajectoryTableProps> = ({
  datasets,
  selectedTrajectoryId,
  onSelectTrajectory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pathTypeFilter, setPathTypeFilter] = useState<string>('all');
  const [splitFilter, setSplitFilter] = useState<'all' | SplitType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Filter trajectories by search query, motion type, and split
  const filteredDatasets = useMemo(() => {
    return datasets.filter((d) => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(query);
        const matchesId = d.id.toLowerCase().includes(query);
        const matchesModel = d.motionModel.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesModel) return false;
      }

      if (pathTypeFilter !== 'all' && d.motionType !== pathTypeFilter) {
        return false;
      }

      if (splitFilter !== 'all' && d.split !== splitFilter) {
        return false;
      }

      return true;
    });
  }, [datasets, searchTerm, pathTypeFilter, splitFilter]);

  const totalPages = Math.ceil(filteredDatasets.length / rowsPerPage) || 1;
  const paginatedDatasets = filteredDatasets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const trainCount = datasets.filter((d) => d.split === 'train').length;
  const valCount = datasets.filter((d) => d.split === 'validation').length;
  const testCount = datasets.filter((d) => d.split === 'test').length;

  // Render miniature SVG path thumbnail
  const renderPathThumbnail = (motionType: TrajectoryDatasetItem['motionType']) => {
    switch (motionType) {
      case 'figure_eight':
        return (
          <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
            <path
              d="M10 10C5 3 0 17 10 17C18 17 22 3 30 3C40 3 35 17 30 17C22 17 18 3 10 3C0 3 5 17 10 10Z"
              stroke="#2563EB"
              strokeWidth="1.8"
            />
          </svg>
        );
      case 'corridor_perimeter':
        return (
          <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
            <rect x="4" y="3" width="32" height="14" rx="3" stroke="#059669" strokeWidth="1.8" />
          </svg>
        );
      case 'random_walk':
        return (
          <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
            <path d="M4 14L10 6L16 16L24 4L30 15L36 8" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case 'sharp_turns':
        return (
          <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
            <path d="M4 10C12 2 18 18 24 10C30 2 36 18 38 10" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case 'straight_line':
        return (
          <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
            <line x1="4" y1="16" x2="36" y2="4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'curved':
      default:
        return (
          <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
            <path d="M4 10C12 3 20 17 28 10C32 6 36 14 38 10" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const getSplitBadge = (split: SplitType) => {
    switch (split) {
      case 'train':
        return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
      case 'validation':
        return 'bg-[#E8F8F2] text-[#159B71] border-[#B9E9D7]';
      case 'test':
        return 'bg-[#F0ECFC] text-[#8B6CF6] border-[#DDD6FE]';
    }
  };

  const getNoiseBadge = (label: string) => {
    if (label.includes('Low')) return 'bg-[#E8F8F2] text-[#159B71] border-[#B9E9D7]';
    if (label.includes('Moderate')) return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
    return 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA]';
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Table Header and Search Bar */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F0F3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F8F2] text-[#159B71] flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171719] tracking-tight">
                Trajectory Dataset Library
              </h2>
              <p className="text-xs text-[#74747B]">
                Reproducible kinematically constrained paths with ground-truth positions.
              </p>
            </div>
          </div>

          {/* Search & Dropdown Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#74747B] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search trajectories..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#F4F4F6] hover:bg-[#ECECEF] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E5E5E9] focus:outline-none focus:ring-1 focus:ring-[#D9F56F] w-40 sm:w-48"
              />
            </div>

            <div className="relative">
              <select
                value={pathTypeFilter}
                onChange={(e) => {
                  setPathTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-[#F4F4F6] text-xs font-semibold text-[#171719] pl-3 pr-7 py-1.5 rounded-lg border border-[#E5E5E9] cursor-pointer focus:outline-none"
              >
                <option value="all">All Path Types</option>
                <option value="figure_eight">Figure-8 Loop</option>
                <option value="corridor_perimeter">Corridor Perimeter</option>
                <option value="random_walk">Random Walk</option>
                <option value="sharp_turns">Sharp Turns</option>
                <option value="straight_line">Straight Line</option>
                <option value="curved">Curved Spline</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#74747B] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Split Filter Tabs */}
        <div className="flex items-center gap-2 pt-3 pb-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setSplitFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              splitFilter === 'all'
                ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            All ({datasets.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setSplitFilter('train');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              splitFilter === 'train'
                ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Train ({trainCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setSplitFilter('validation');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              splitFilter === 'validation'
                ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Validation ({valCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setSplitFilter('test');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              splitFilter === 'test'
                ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Test ({testCount})
          </button>
        </div>
      </div>

      {/* Trajectories Table */}
      <div className="overflow-x-auto my-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E5E5E9] text-[#74747B] font-semibold">
              <th className="py-2.5 px-3 w-8 text-center">Select</th>
              <th className="py-2.5 px-3">ID</th>
              <th className="py-2.5 px-3">Path Preview</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Waypoints</th>
              <th className="py-2.5 px-3 text-right">Length (m)</th>
              <th className="py-2.5 px-3 text-center">Noise Profile</th>
              <th className="py-2.5 px-3 text-center">Split</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F3] text-[#171719]">
            {paginatedDatasets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#74747B] text-xs">
                  No matching trajectories found. Try adjusting your search query or filters.
                </td>
              </tr>
            ) : (
              paginatedDatasets.map((traj) => {
                const isSelected = traj.id === selectedTrajectoryId;

                return (
                  <tr
                    key={traj.id}
                    onClick={() => onSelectTrajectory(traj.id)}
                    className={`hover:bg-[#F9F9FB] transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F6FCE8]/60 font-medium' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#159B71] inline" />
                      ) : (
                        <Square className="w-4 h-4 text-[#A0A0A8] inline" />
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-[#171719]">{traj.id}</td>

                    <td className="py-2.5 px-3">{renderPathThumbnail(traj.motionType)}</td>

                    <td className="py-2.5 px-3 font-semibold text-[#171719]">{traj.name}</td>

                    <td className="py-2.5 px-3 text-right font-mono text-[#555555]">
                      {traj.waypointsCount}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[#555555]">
                      {traj.lengthMeters.toFixed(1)}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getNoiseBadge(
                          traj.noiseLevelLabel
                        )}`}
                      >
                        {traj.noiseLevelLabel}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border ${getSplitBadge(
                          traj.split
                        )}`}
                      >
                        {traj.split}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrajectory(traj.id);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isSelected
                              ? 'bg-[#D9F56F] text-[#171719]'
                              : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-100'
                          }`}
                          title="Preview Trajectory"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-[#A0A0A8] hover:text-[#171719] rounded-md transition-colors"
                          title="More options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pt-3 border-t border-[#F0F0F3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#74747B] gap-2">
        <div>
          Showing {paginatedDatasets.length} of {filteredDatasets.length} trajectories
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px]">Rows per page: {rowsPerPage}</span>
          <div className="inline-flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-6 h-6 rounded-md text-[11px] font-bold transition-all ${
                  currentPage === pg
                    ? 'bg-[#D9F56F] text-[#171719]'
                    : 'text-[#74747B] hover:bg-neutral-100 hover:text-[#171719]'
                }`}
              >
                {pg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
