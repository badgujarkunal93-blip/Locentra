import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { BenchmarkViewMode } from './types';

interface BenchmarkHeaderProps {
  viewMode: BenchmarkViewMode;
  onViewModeChange: (mode: BenchmarkViewMode) => void;
  onRunBenchmark: () => void;
  isRunning: boolean;
}

export const BenchmarkHeader: React.FC<BenchmarkHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onRunBenchmark,
  isRunning,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold tracking-widest text-[#74747B] uppercase bg-[#EAEAEA] px-2 py-0.5 rounded-md">
            Scientific Evaluation
          </span>
          <span className="text-[10px] text-[#888890] font-mono">
            Locentra Arena v0.1.0-alpha
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171719] tracking-tight">
          Benchmark Arena &amp; Error Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[#74747B] mt-1 max-w-2xl">
          Compare positioning algorithms using measured simulation results and empirical error distributions.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center bg-white p-1 rounded-xl border border-[#E5E5E9] shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange('cdf')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'cdf'
                ? 'bg-[#D9F56F] text-[#171719] shadow-sm font-bold'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Error CDF
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('quantiles')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'quantiles'
                ? 'bg-[#D9F56F] text-[#171719] shadow-sm font-bold'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Error Quantiles
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('monte-carlo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'monte-carlo'
                ? 'bg-[#D9F56F] text-[#171719] shadow-sm font-bold'
                : 'text-[#74747B] hover:text-[#171719] hover:bg-neutral-50'
            }`}
          >
            Monte Carlo Runs
          </button>
        </div>

        {/* Primary Run Benchmark Action */}
        <button
          type="button"
          onClick={onRunBenchmark}
          disabled={isRunning}
          aria-label="Run Benchmark (Run Numerical Benchmark)"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D9F56F] hover:bg-[#cbf056] text-[#171719] font-bold text-xs shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#171719]" />
              <span>Running Benchmark...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-[#171719] text-[#171719]" />
              <span>Run Benchmark</span>
              <span className="sr-only">Run Numerical Benchmark</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
