import React from 'react';
import { ShieldCheck, Database, Clock, Activity, AlertTriangle, ShieldAlert } from 'lucide-react';

interface BenchmarkStatusBarProps {
  isBackendConnected: boolean;
  solverCount: number;
  lastRunTimestamp: string | null;
  pointCount: number | null;
  roomDimensions: string;
  executionStatus: 'idle' | 'loading' | 'success' | 'error';
  isLiveBackendData: boolean;
  errorMessage?: string | null;
}

export const BenchmarkStatusBar: React.FC<BenchmarkStatusBarProps> = ({
  isBackendConnected,
  solverCount,
  lastRunTimestamp,
  pointCount,
  roomDimensions,
  executionStatus,
  isLiveBackendData,
  errorMessage,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Backend Connectivity */}
      <div className="bg-white rounded-2xl border border-[#E5E5E9] p-3.5 flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isBackendConnected ? 'bg-[#E8F8F2] text-[#159B71]' : 'bg-rose-50 text-rose-600'
          }`}
        >
          {isBackendConnected ? (
            <ShieldCheck className="w-5 h-5" />
          ) : (
            <ShieldAlert className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#171719] truncate">
            {isBackendConnected ? 'Backend Connected' : 'Backend Offline'}
          </div>
          <div className="text-[11px] text-[#74747B] truncate">
            {isBackendConnected ? 'FastAPI Engine Online' : 'Check local :8000 or Render'}
          </div>
        </div>
      </div>

      {/* 2. Solvers Evaluated */}
      <div className="bg-white rounded-2xl border border-[#E5E5E9] p-3.5 flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
        <div className="w-9 h-9 rounded-xl bg-[#F0ECFC] text-[#8B6CF6] flex items-center justify-center shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#171719] truncate">
            {isLiveBackendData ? `${solverCount} Solvers Compared` : `${solverCount} Solvers Configured`}
          </div>
          <div className="text-[11px] text-[#74747B] truncate">
            {isLiveBackendData ? 'Using current scenario' : 'Ready for numerical run'}
          </div>
        </div>
      </div>

      {/* 3. Latest Run */}
      <div className="bg-white rounded-2xl border border-[#E5E5E9] p-3.5 flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
        <div className="w-9 h-9 rounded-xl bg-[#E9F3FF] text-[#268BFF] flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#171719] truncate">
            {lastRunTimestamp ? 'Latest Run Completed' : 'Session Benchmark'}
          </div>
          <div className="text-[11px] text-[#74747B] truncate">
            {lastRunTimestamp && pointCount
              ? `${pointCount} pts • ${roomDimensions}`
              : 'No runs yet in session'}
          </div>
        </div>
      </div>

      {/* 4. Execution State */}
      <div className="bg-white rounded-2xl border border-[#E5E5E9] p-3.5 flex items-center gap-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)]">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            executionStatus === 'loading'
              ? 'bg-[#D9F56F] text-[#171719] animate-pulse'
              : executionStatus === 'error'
              ? 'bg-rose-50 text-rose-600'
              : executionStatus === 'success'
              ? 'bg-[#E8F8F2] text-[#159B71]'
              : 'bg-[#F2F2F5] text-[#74747B]'
          }`}
        >
          {executionStatus === 'error' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Activity className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#171719] truncate">
            {executionStatus === 'loading'
              ? 'Benchmark Running...'
              : executionStatus === 'error'
              ? 'Benchmark Failed'
              : executionStatus === 'success'
              ? 'Evaluation Ready'
              : 'Ready to benchmark'}
          </div>
          <div className="text-[11px] text-[#74747B] truncate">
            {executionStatus === 'loading'
              ? 'Computing solver metrics'
              : executionStatus === 'error'
              ? errorMessage || 'API request failed'
              : executionStatus === 'success'
              ? 'Empirical metrics live'
              : 'Select solvers & run'}
          </div>
        </div>
      </div>
    </div>
  );
};
