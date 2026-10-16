import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, ChevronDown, CheckCircle2 } from 'lucide-react';
import { CdfDataPoint, SolverDisplayMeta } from './types';

interface EmpiricalCdfPanelProps {
  data: CdfDataPoint[];
  solvers: SolverDisplayMeta[];
  selectedSolverIds: string[];
  onToggleSolverId?: (id: string) => void;
  sampleCount: number;
  isLive: boolean;
  onRunBenchmark: () => void;
}

export const EmpiricalCdfPanel: React.FC<EmpiricalCdfPanelProps> = ({
  data,
  solvers,
  selectedSolverIds,
  sampleCount,
  isLive,
  onRunBenchmark,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeRunTab, setActiveRunTab] = useState<'latest' | 'recent'>('latest');

  // Filter which solvers are rendered on chart
  const visibleSolvers = solvers.filter((s) => {
    if (activeFilter !== 'all' && s.id !== activeFilter) return false;
    if (selectedSolverIds.length > 0 && !selectedSolverIds.includes(s.id)) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E5E9] p-5 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F0F3]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F8F2] text-[#159B71] flex items-center justify-center shrink-0 mt-0.5">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#171719] tracking-tight">
                Empirical Cumulative Distribution of Positioning Error (CDF)
              </h2>
            </div>
            <p className="text-xs text-[#74747B]">
              Fraction of valid position estimates with error less than or equal to each threshold.
            </p>
          </div>
        </div>

        {/* Controls: Solver dropdown and run switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              aria-label="Filter solvers on CDF"
              className="appearance-none bg-[#F4F4F6] hover:bg-[#ECECEF] text-xs font-semibold text-[#171719] pl-3 pr-7 py-1.5 rounded-lg border border-[#E5E5E9] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D9F56F]"
            >
              <option value="all">All solvers</option>
              {solvers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#74747B] absolute right-2 top-2 pointer-events-none" />
          </div>

          <div className="inline-flex items-center bg-[#F4F4F6] p-0.5 rounded-lg border border-[#E5E5E9]">
            <button
              type="button"
              onClick={() => setActiveRunTab('latest')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                activeRunTab === 'latest'
                  ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                  : 'text-[#74747B] hover:text-[#171719]'
              }`}
            >
              Latest run
            </button>
            <button
              type="button"
              onClick={() => setActiveRunTab('recent')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                activeRunTab === 'recent'
                  ? 'bg-[#D9F56F] text-[#171719] shadow-xs'
                  : 'text-[#74747B] hover:text-[#171719]'
              }`}
            >
              Recent runs
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas or Informative Empty State */}
      {data.length === 0 ? (
        <div className="h-80 flex flex-col items-center justify-center text-center p-6 bg-[#FAFAFA] rounded-2xl border border-dashed border-[#E5E5E9] my-3">
          <BarChart3 className="w-10 h-10 text-[#C0C0C8] mb-2" />
          <h4 className="text-sm font-bold text-[#171719]">Awaiting Empirical Distribution</h4>
          <p className="text-xs text-[#74747B] max-w-sm mt-1 mb-4">
            No valid position error samples available. Run a numerical benchmark to compute the empirical CDF across solvers.
          </p>
          <button
            type="button"
            onClick={onRunBenchmark}
            className="px-4 py-2 bg-[#D9F56F] text-[#171719] font-bold text-xs rounded-xl shadow-xs hover:bg-[#cbf056] cursor-pointer"
          >
            Run Numerical Benchmark
          </button>
        </div>
      ) : (
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 25, left: -5, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F3" vertical={false} />
              <XAxis
                dataKey="errorMeters"
                stroke="#C0C0C8"
                tick={{ fill: '#74747B', fontSize: 11 }}
                unit=" m"
                label={{
                  value: 'Positioning error (m)',
                  position: 'insideBottom',
                  offset: -10,
                  fill: '#74747B',
                  fontSize: 11,
                }}
              />
              <YAxis
                stroke="#C0C0C8"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(val) => `${val}%`}
                tick={{ fill: '#74747B', fontSize: 11 }}
                label={{
                  value: 'Cumulative fraction (%)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 15,
                  fill: '#74747B',
                  fontSize: 11,
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="bg-white/95 backdrop-blur-md border border-[#E5E5E9] rounded-xl p-3 shadow-lg text-xs font-sans min-w-[180px]">
                      <div className="font-bold text-[#171719] mb-1.5 pb-1 border-b border-[#F0F0F3] flex items-center justify-between">
                        <span>Threshold:</span>
                        <span className="font-mono text-[#159B71]">{label} m</span>
                      </div>
                      <div className="space-y-1">
                        {payload.map((item) => (
                          <div
                            key={item.dataKey as string}
                            className="flex items-center justify-between gap-3 text-[11px]"
                          >
                            <span className="flex items-center gap-1.5 text-[#555555]">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </span>
                            <span className="font-bold font-mono text-[#171719]">
                              {Number(item.value).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
                formatter={(val) => (
                  <span className="text-[#171719] font-medium text-xs mr-3">
                    {val}
                  </span>
                )}
              />
              {visibleSolvers.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: s.color }}
                  activeDot={{ r: 5, fill: s.color, stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-2 pt-3 border-t border-[#F0F0F3] flex flex-col sm:flex-row items-center justify-between text-xs text-[#74747B] gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#159B71]" />
          <span>Steeper slope indicates higher concentration of sub-meter estimates.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-[#171719]">
            {isLive ? `Live Evaluated: ${sampleCount} points` : `Demo Baseline: ${sampleCount} points`}
          </span>
        </div>
      </div>
    </div>
  );
};
