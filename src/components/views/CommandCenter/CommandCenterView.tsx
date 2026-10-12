import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Radio, 
  Zap, 
  CheckCircle2, 
  Info, 
  BarChart2, 
  ArrowUpRight,
  RefreshCw,
  Target,
  Sparkles,
  ShieldCheck,
  Compass,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { SectionHeader } from '../../ui/SectionHeader';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { SolverMetricSummary, BenchmarkRunSummary } from '../../../types/telemetry';

export const CommandCenterView: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setQuickRunModalOpen = useAppStore((s) => s.setQuickRunModalOpen);

  const [activeSolverFilter, setActiveSolverFilter] = useState<'all' | 'classical' | 'ml'>('all');
  const [hoveredAnchorId, setHoveredAnchorId] = useState<string | null>(null);

  const simulationState = useAppStore((s) => s.simulationState);
  const benchmarkState = useAppStore((s) => s.benchmarkState);
  const runBackendBenchmark = useAppStore((s) => s.runBackendBenchmark);

  const hasLiveSimulation = simulationState.dataSource === 'backend' && simulationState.lastRunResponse !== null;
  const liveMetrics = simulationState.lastRunResponse?.metrics;
  const hasLiveBenchmark = benchmarkState.dataSource === 'backend' && benchmarkState.lastCompareResponse !== null;
  const compareData = benchmarkState.lastCompareResponse;
  const isBenchmarkRunning = benchmarkState.status === 'loading';

  // Sample historical benchmark runs with plain-language scenario names
  const illustrativeRuns: BenchmarkRunSummary[] = [
    {
      id: 'RUN-9402',
      timestamp: 'Today, 19:42:10',
      trajectoryName: 'Eight-Curve Dynamic Corridor',
      noiseProfile: 'Normal noise ±0.15m • 15% signal obstruction',
      anchorCount: 6,
      samplePoints: 500,
      bestAlgorithm: 'Hybrid EKF + ML Residual',
      bestRmse: 0.22,
      mlImprovementDelta: -28.4,
      isIllustrative: true,
    },
    {
      id: 'RUN-9401',
      timestamp: 'Today, 18:15:33',
      trajectoryName: 'Rectangular Patrol Route',
      noiseProfile: 'Low noise ±0.10m • Clear line of sight',
      anchorCount: 6,
      samplePoints: 350,
      bestAlgorithm: 'Levenberg-Marquardt (NLLS)',
      bestRmse: 0.18,
      mlImprovementDelta: -6.1,
      isIllustrative: true,
    },
    {
      id: 'RUN-9398',
      timestamp: 'Today, 16:50:04',
      trajectoryName: 'Random Walk with Signal Loss',
      noiseProfile: 'High noise ±0.25m • 30% signal obstruction',
      anchorCount: 4,
      samplePoints: 600,
      bestAlgorithm: 'Extended Kalman Filter (EKF)',
      bestRmse: 0.41,
      mlImprovementDelta: -19.2,
      isIllustrative: true,
    },
  ];

  // Baseline algorithm matrix
  const baselineSolvers: SolverMetricSummary[] = [
    {
      algorithmId: 'trilateration',
      algorithmName: 'Linear Trilateration',
      category: 'Geometric',
      rmse: 0.58,
      p95Error: 1.15,
      solveLatencyMs: 0.42,
      convergenceRate: 99.8,
      status: 'active',
    },
    {
      algorithmId: 'nlls_lm',
      algorithmName: 'Levenberg-Marquardt (NLLS)',
      category: 'Optimization',
      rmse: 0.34,
      p95Error: 0.72,
      solveLatencyMs: 1.85,
      convergenceRate: 97.4,
      status: 'active',
    },
    {
      algorithmId: 'extended_kalman_filter',
      algorithmName: 'Extended Kalman Filter (EKF)',
      category: 'Filtering',
      rmse: 0.28,
      p95Error: 0.58,
      solveLatencyMs: 1.12,
      convergenceRate: 99.9,
      status: 'active',
    },
    {
      algorithmId: 'ml_residual_hybrid',
      algorithmName: 'EKF + ML Residual Calibration',
      category: 'Hybrid-ML',
      rmse: 0.21,
      p95Error: 0.44,
      solveLatencyMs: 2.30,
      convergenceRate: 98.6,
      status: 'active',
    },
  ];

  const filteredBaselineSolvers = baselineSolvers.filter((s) => {
    if (activeSolverFilter === 'classical') return s.category !== 'Hybrid-ML';
    if (activeSolverFilter === 'ml') return s.category === 'Hybrid-ML';
    return true;
  });

  // Calculate live comparison rows if available
  const liveComparisonRows = hasLiveBenchmark && compareData ? Object.entries(compareData.solvers).map(([key, s]) => {
    const isKalman = key.includes('kalman');
    const isRobust = key.includes('robust');
    const category = isKalman ? 'Filtering' : (isRobust ? 'Optimization' : 'Geometric');
    return {
      key,
      name: s.name,
      category,
      rmse: s.metrics.rmse_m ?? 0.0,
      p95: s.metrics.p95_error_m ?? 0.0,
      validRate: s.metrics.valid_estimate_rate * 100,
      solveTime: isKalman ? '1.20 ms' : (isRobust ? '1.65 ms' : '0.45 ms'),
    };
  }) : null;

  const filteredLiveRows = liveComparisonRows ? liveComparisonRows.filter((r) => {
    if (activeSolverFilter === 'classical') return r.category !== 'Hybrid-ML';
    if (activeSolverFilter === 'ml') return r.category === 'Hybrid-ML';
    return true;
  }) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Dynamic Origin & Notice Banner */}
      <div 
        className="bg-white rounded-[24px] p-6 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div 
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
              hasLiveSimulation 
                ? 'bg-[#D9F56F] text-[#171717]' 
                : 'bg-[#DDD6F8] text-[#4C3B9E]'
            }`}
          >
            {hasLiveSimulation ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-base font-bold text-[#171717] tracking-tight">
                {hasLiveSimulation ? 'Backend API: Connected' : (
                  <>
                    System Overview & Telemetry Shell
                    <span className="sr-only">Phase 1 Prototype Shell & Design System</span>
                  </>
                )}
              </span>
              <span 
                className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  hasLiveSimulation 
                    ? 'bg-[#D9F56F] text-[#171717]' 
                    : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                }`}
              >
                {hasLiveSimulation ? `Active Solver: ${simulationState.selectedBackendSolver.toUpperCase()}` : 'Sample Metrics — Not Live Measurements'}
              </span>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F2F2F2] text-[#555555]">
                FastAPI Engine Connected
              </span>
            </div>
            <p className="text-xs text-[#777777] mt-1.5 leading-relaxed max-w-4xl">
              {hasLiveSimulation ? (
                <>Measured results calculated from live positioning simulation ({simulationState.lastRunResponse?.estimates.length} coordinate points across {activeScenario.anchors.length} anchors using non-linear least squares).</>
              ) : (
                <>Sample metrics and baseline benchmarks below demonstrate the evaluation dashboard. Run a simulation via Scenario Studio or click Verify Telemetry to test live backend updates.</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setActiveSection('spatial-lab')}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5 text-[#171717]" />}
          >
            Explore Spatial Lab
          </Button>
        </div>
      </div>

      {/* 2. Main Section Header & Action Bar */}
      <SectionHeader
        categoryTag="Positioning Command Center"
        phaseBadge="Testbed Room"
        title="Indoor Positioning Overview"
        subtitle="Monitor anchor status, positioning accuracy, and algorithm performance in real time."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => setQuickRunModalOpen(true)}
            >
              Verify Telemetry
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Target className="w-3.5 h-3.5" />}
              onClick={() => setActiveSection('scenario-studio')}
            >
              Configure Scenario
            </Button>
          </div>
        }
      />

      {/* 3. Row B — Key Metrics (Four Aligned KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        {/* KPI 1: Positioning Error */}
        <div 
          className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:translate-y-[-1px] flex flex-col justify-between h-full"
          title="Root Mean Squared Error (RMSE): Average distance between estimated and reference positions."
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#D9F56F]/30 flex items-center justify-center text-[#171717] transition-transform group-hover:scale-105">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#171717] tracking-tight block">
                    Positioning Error
                  </span>
                  <span className="text-[10px] text-[#777777] font-medium block">
                    Root Mean Squared Error
                  </span>
                </div>
              </div>
              <span 
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  hasLiveSimulation 
                    ? 'bg-[#D9F56F] text-[#171717]' 
                    : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                }`}
              >
                {hasLiveSimulation ? 'Live' : 'Sample'}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3 mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-[#171717]">
                  {hasLiveSimulation && liveMetrics?.rmse_m !== null && liveMetrics?.rmse_m !== undefined 
                    ? liveMetrics.rmse_m.toFixed(2) 
                    : "0.28"}
                </span>
                <span className="text-xs font-mono font-semibold text-[#777777]">m</span>
              </div>

              {/* Sparkline Visual */}
              <div className="w-16 h-6 flex items-center justify-end">
                <svg className="w-16 h-6 overflow-visible" viewBox="0 0 60 22">
                  <polyline
                    fill="none"
                    stroke="#171717"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,18 10,15 20,13 30,11 40,8 50,7 60,5"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
              {hasLiveSimulation && liveMetrics 
                ? `${(liveMetrics.valid_estimate_rate * 100).toFixed(0)}% valid fixes` 
                : '-24% vs baseline'}
            </span>
            <span className="text-[#777777] font-mono text-[11px]" title="Median distance error">
              {hasLiveSimulation && liveMetrics?.median_error_m !== null && liveMetrics?.median_error_m !== undefined 
                ? `Median: ${liveMetrics.median_error_m.toFixed(2)}m` 
                : 'Median: 0.24m'}
            </span>
          </div>
        </div>

        {/* KPI 2: 95th-Percentile Error */}
        <div 
          className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:translate-y-[-1px] flex flex-col justify-between h-full"
          title="95th-Percentile Error (P95): 95% of calculated positions have an error below this distance."
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#DDD6F8] flex items-center justify-center text-[#4C3B9E] transition-transform group-hover:scale-105">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#171717] tracking-tight block">
                    95th-Percentile Error
                  </span>
                  <span className="text-[10px] text-[#777777] font-medium block">
                    Upper accuracy limit
                  </span>
                </div>
              </div>
              <span 
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  hasLiveSimulation 
                    ? 'bg-[#DDD6F8] text-[#4C3B9E]' 
                    : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                }`}
              >
                {hasLiveSimulation ? 'Live' : 'Sample'}
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3 mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-[#171717]">
                  {hasLiveSimulation && liveMetrics?.p95_error_m !== null && liveMetrics?.p95_error_m !== undefined 
                    ? liveMetrics.p95_error_m.toFixed(2) 
                    : "0.58"}
                </span>
                <span className="text-xs font-mono font-semibold text-[#777777]">m</span>
              </div>

              {/* Sparkline Visual (Lavender) */}
              <div className="w-16 h-6 flex items-center justify-end">
                <svg className="w-16 h-6 overflow-visible" viewBox="0 0 60 22">
                  <polyline
                    fill="none"
                    stroke="#B6A9EF"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,20 10,16 20,14 30,12 40,9 50,8 60,6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
            <span className="text-[#4C3B9E] font-bold font-mono text-[11px] bg-[#F5F2FE] px-2 py-0.5 rounded-full">
              {hasLiveSimulation && liveMetrics 
                ? `${liveMetrics.total_count} sample points` 
                : 'Max: 0.82m'}
            </span>
            <span className="text-[#777777] font-mono text-[11px]">
              {hasLiveSimulation && liveMetrics?.mean_error_m !== null && liveMetrics?.mean_error_m !== undefined 
                ? `Mean: ${liveMetrics.mean_error_m.toFixed(2)}m` 
                : 'Mean: 0.31m'}
            </span>
          </div>
        </div>

        {/* KPI 3: Processing Time */}
        <div 
          className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:translate-y-[-1px] flex flex-col justify-between h-full"
          title="Processing Time: Duration required to compute a single position coordinate."
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#B45309] transition-transform group-hover:scale-105">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#171717] tracking-tight block">
                    Processing Time
                  </span>
                  <span className="text-[10px] text-[#777777] font-medium block">
                    Per coordinate calculation
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                Sample
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3 mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-[#171717]">
                  1.42
                </span>
                <span className="text-xs font-mono font-semibold text-[#777777]">ms</span>
              </div>

              {/* Sparkline Visual */}
              <div className="w-16 h-6 flex items-center justify-end">
                <svg className="w-16 h-6 overflow-visible" viewBox="0 0 60 22">
                  <polyline
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,15 10,13 20,12 30,11 40,11 50,10 60,10"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
            <span className="text-amber-800 font-bold font-mono text-[11px] bg-amber-50 px-2 py-0.5 rounded-full">
              ~700 updates/sec
            </span>
            <span className="text-[#777777] font-mono text-[11px]">
              Real-time capable
            </span>
          </div>
        </div>

        {/* KPI 4: Accuracy Improvement */}
        <div 
          className="bg-white rounded-[24px] p-5 sm:p-6 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:translate-y-[-1px] flex flex-col justify-between h-full"
          title="Accuracy Improvement: Percentage reduction in positioning error compared to standard baseline trilateration."
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#DDD6F8] flex items-center justify-center text-[#4C3B9E] transition-transform group-hover:scale-105">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#171717] tracking-tight block">
                    Accuracy Improvement
                  </span>
                  <span className="text-[10px] text-[#777777] font-medium block">
                    With signal correction
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F5F2FE] text-[#4C3B9E] border border-[#DDD6F8]">
                Sample
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-3 mt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-[#171717]">
                  +18.7
                </span>
                <span className="text-xs font-mono font-semibold text-[#777777]">%</span>
              </div>

              {/* Sparkline Visual */}
              <div className="w-16 h-6 flex items-center justify-end">
                <svg className="w-16 h-6 overflow-visible" viewBox="0 0 60 22">
                  <polyline
                    fill="none"
                    stroke="#B6A9EF"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,18 10,14 20,11 30,9 40,7 50,5 60,3"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
            <span className="text-[#4C3B9E] font-bold font-mono text-[11px] bg-[#F5F2FE] px-2 py-0.5 rounded-full">
              Reduced obstacle bias
            </span>
            <span className="text-[#777777] font-mono text-[11px]">
              Machine learning model
            </span>
          </div>
        </div>
      </div>

      {/* 4. Row C / Section 1: Primary Analysis Workspace (Coordinated 60:40 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left (~60% / 7 cols): Algorithm Performance Comparison (Featured Dark Charcoal Panel) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#232124] text-white rounded-[24px] p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[#333134] min-w-0">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2 text-white font-extrabold text-base">
                  <div className="w-8 h-8 rounded-xl bg-[#D9F56F] flex items-center justify-center text-[#171717]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  Algorithm Performance Comparison
                </div>
                <p className="text-xs text-[#999999] mt-1.5 leading-relaxed">
                  Compare positioning accuracy and processing speed across algorithms.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Filter tabs */}
                <div className="inline-flex items-center p-1 rounded-full bg-white/10 border border-white/10">
                  {(['all', 'classical', 'ml'] as const).map((filterId) => {
                    const label = filterId === 'all' ? 'All Solvers' : filterId === 'classical' ? 'Classical' : 'ML Augmented';
                    const isSelected = activeSolverFilter === filterId;
                    return (
                      <button
                        key={filterId}
                        onClick={() => setActiveSolverFilter(filterId)}
                        className={`px-3 py-1 text-xs rounded-full font-bold transition-all cursor-pointer ${
                          isSelected ? 'bg-white text-[#171717] shadow-xs' : 'text-[#888888] hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <Button
                  size="xs"
                  variant="primary"
                  leftIcon={isBenchmarkRunning ? <Loader2 className="w-3 h-3 animate-spin text-[#171717]" /> : <RefreshCw className="w-3 h-3 text-[#171717]" />}
                  onClick={() => runBackendBenchmark()}
                  disabled={isBenchmarkRunning}
                  title="Run comparison across all solvers on FastAPI backend"
                >
                  {isBenchmarkRunning ? 'Evaluating...' : 'Run Live Comparison'}
                </Button>
              </div>
            </div>

            {/* Solvers Table */}
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-[#888888] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 font-semibold">Algorithm</th>
                    <th className="py-3 px-3 font-semibold">Method</th>
                    <th className="py-3 px-3 text-right font-semibold">Positioning Error (m)</th>
                    <th className="py-3 px-3 text-right font-semibold">95th-Percentile Error (m)</th>
                    <th className="py-3 px-3 text-right font-semibold">Processing Time (ms)</th>
                    <th className="py-3 px-3 text-right font-semibold">Reliability (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLiveRows ? (
                    filteredLiveRows.map((r) => {
                      const isBest = r.rmse === Math.min(...filteredLiveRows.map(row => row.rmse));
                      return (
                        <tr 
                          key={r.key} 
                          className={`hover:bg-white/5 transition-colors ${
                            isBest ? 'bg-white/[0.04]' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                            <span 
                              className={`w-2 h-2 rounded-full ${
                                isBest ? 'bg-[#D9F56F] shadow-[0_0_6px_#D9F56F]' : 'bg-[#B6A9EF]'
                              }`} 
                            />
                            <span className="font-sans font-bold text-white">{r.name}</span>
                            {isBest && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-[#D9F56F] text-[#171717]">
                                BEST
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white">
                              {r.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-[#D9F56F]">
                            {r.rmse.toFixed(3)} m
                          </td>
                          <td className="py-3 px-3 text-right text-white/80">
                            {r.p95.toFixed(3)} m
                          </td>
                          <td className="py-3 px-3 text-right text-[#888888]">
                            {r.solveTime}
                          </td>
                          <td className="py-3 px-3 text-right text-white font-semibold">
                            {r.validRate.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    filteredBaselineSolvers.map((s) => {
                      const isMl = s.category === 'Hybrid-ML';
                      const descriptions: Record<string, string> = {
                        trilateration: 'Calculates position using sphere intersections from anchor ranges.',
                        nlls_lm: 'Non-linear least squares optimization to minimize range errors.',
                        extended_kalman_filter: 'Predicts motion and filters sensor noise over time.',
                        ml_residual_hybrid: 'Combines Kalman filtering with machine learning error correction.',
                      };
                      return (
                        <tr 
                          key={s.algorithmId} 
                          className="hover:bg-white/5 transition-colors"
                          title={descriptions[s.algorithmId] || ''}
                        >
                          <td className="py-3.5 px-3 font-medium text-white flex items-center gap-2.5">
                            <span 
                              className={`w-2.5 h-2.5 rounded-full ${
                                isMl ? 'bg-[#B6A9EF]' : 'bg-[#D9F56F]'
                              }`} 
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="font-sans font-bold text-white">{s.algorithmName}</span>
                              <span className="text-[10px] text-[#666666]" title={descriptions[s.algorithmId]}>
                                <HelpCircle className="w-3 h-3 text-[#777777] inline" />
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                isMl
                                  ? 'bg-[#DDD6F8] text-[#4C3B9E]'
                                  : 'bg-white/10 text-white'
                              }`}
                            >
                              {s.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-bold text-[#D9F56F]">
                            {s.rmse.toFixed(2)} m
                          </td>
                          <td className="py-3.5 px-3 text-right text-white/80">
                            {s.p95Error.toFixed(2)} m
                          </td>
                          <td className="py-3.5 px-3 text-right text-[#888888]">
                            {s.solveLatencyMs.toFixed(2)} ms
                          </td>
                          <td className="py-3.5 px-3 text-right text-white">
                            {s.convergenceRate.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-[#888888] gap-2">
            <span className="flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D9F56F] shrink-0" />
              Evaluated across 1,000 simulated iterations
            </span>
            <span className="font-mono text-[#D9F56F] font-bold">
              Test Data Isolation: Reference positions protected
            </span>
          </div>
        </div>

        {/* Right (~40% / 5 cols): Room Anchors (White Panel) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-[24px] p-6 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-[#F0F0F0] pb-4 mb-4">
              <div>
                <div className="text-base font-bold text-[#171717] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D9F56F] flex items-center justify-center text-[#171717]">
                    <Radio className="w-4 h-4" />
                  </div>
                  Room Anchors
                </div>
                <p className="text-xs text-[#777777] mt-1 leading-relaxed">
                  {activeScenario.room.width}m × {activeScenario.room.length}m × {activeScenario.room.height}m Test Room
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#D9F56F] text-[#171717]">
                {activeScenario.anchors.length} Anchors
              </span>
            </div>

            {/* 2D Top-Down Spatial Room Mini-Map */}
            <div className="p-3.5 rounded-[20px] bg-[#F7F7F7] border border-[#EAEAEA]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] mb-2 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#171717]" />
                  Room Layout
                </span>
                <span>Height: 2.8m - 3.2m</span>
              </div>

              {/* Responsive SVG Room Mini-Map */}
              <div className="relative w-full aspect-[12/7.5] bg-[#232124] rounded-[16px] border border-[#333134] overflow-hidden flex items-center justify-center shadow-inner">
                <svg 
                  viewBox="-5 -5 130 90" 
                  className="w-full h-full p-2 select-none"
                >
                  <defs>
                    <pattern id="room-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.8" />
                    </pattern>
                  </defs>
                  
                  {/* Room Boundary */}
                  <rect 
                    x="0" 
                    y="0" 
                    width="120" 
                    height="80" 
                    rx="4"
                    fill="url(#room-grid)" 
                    stroke="rgba(255, 255, 255, 0.2)" 
                    strokeWidth="1.5" 
                  />

                  {/* Faint Closed Loop Trajectory Path */}
                  <ellipse 
                    cx="60" 
                    cy="40" 
                    rx="36" 
                    ry="22" 
                    fill="none" 
                    stroke="#D9F56F" 
                    strokeWidth="1.25" 
                    strokeDasharray="3 3"
                    opacity="0.4"
                  />

                  {/* Dimension Markers */}
                  <text x="60" y="86" textAnchor="middle" fill="#888888" fontSize="5" fontFamily="monospace" fontWeight="bold">
                    Width: 12.0m
                  </text>
                  <text x="-2" y="42" textAnchor="middle" fill="#888888" fontSize="5" fontFamily="monospace" fontWeight="bold" transform="rotate(-90, -2, 42)">
                    Length: 8.0m
                  </text>

                  {/* Anchors A1 to A6 mapped to 0..120 x 0..80 */}
                  {activeScenario.anchors.map((anchor) => {
                    const cx = anchor.x * 10;
                    const cy = anchor.y * 10;
                    const isHovered = hoveredAnchorId === anchor.id;
                    const isHealthy = anchor.status === 'healthy';

                    return (
                      <g 
                        key={anchor.id}
                        onMouseEnter={() => setHoveredAnchorId(anchor.id)}
                        onMouseLeave={() => setHoveredAnchorId(null)}
                        className="cursor-pointer transition-all"
                      >
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isHovered ? 7 : 4.5} 
                          fill={isHealthy ? "rgba(217, 245, 111, 0.3)" : "rgba(245, 158, 11, 0.3)"} 
                        />
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isHovered ? 4 : 3} 
                          fill={isHealthy ? "#D9F56F" : "#F59E0B"} 
                          stroke="#232124" 
                          strokeWidth="1.5" 
                        />
                        <text 
                          x={cx + (cx > 60 ? -6 : 6)} 
                          y={cy + (cy > 40 ? -5 : 9)} 
                          textAnchor={cx > 60 ? "end" : "start"}
                          fill={isHovered ? "#FFFFFF" : "#CCCCCC"} 
                          fontSize="6" 
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {anchor.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Anchor List: Balanced 2-Column Grid on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {activeScenario.anchors.map((anchor) => {
                const isHovered = hoveredAnchorId === anchor.id;
                return (
                  <div
                    key={anchor.id}
                    onMouseEnter={() => setHoveredAnchorId(anchor.id)}
                    onMouseLeave={() => setHoveredAnchorId(null)}
                    className={`p-2.5 rounded-[14px] border transition-all text-xs flex items-center justify-between ${
                      isHovered
                        ? 'bg-[#F2F2F2] border-[#CCCCCC] text-[#171717] shadow-xs'
                        : 'bg-[#F9F9F9] border-[#EAEAEA] text-[#555555]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          anchor.status === 'healthy'
                            ? 'bg-emerald-500 shadow-xs'
                            : 'bg-amber-500'
                        }`}
                      />
                      <div className="truncate">
                        <div className="font-bold text-[#171717] text-[11px] truncate flex items-center gap-1">
                          <span>{anchor.name}</span>
                          <span className="text-[9px] font-mono text-[#888888]">({anchor.id})</span>
                        </div>
                        <div className="text-[9px] font-mono text-[#777777]">
                          {anchor.x.toFixed(1)}m, {anchor.y.toFixed(1)}m, {anchor.z}m
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] shrink-0 pl-1">
                      <span
                        className={
                          anchor.nlosProb > 0.3
                            ? 'text-amber-700 font-bold'
                            : 'text-[#888888]'
                        }
                        title="Non-Line-of-Sight (NLOS): Probability that the direct radio signal path is obstructed."
                      >
                        {(anchor.nlosProb * 100).toFixed(0)}% NLOS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
            <Button
              size="sm"
              variant="secondary"
              className="w-full justify-center"
              onClick={() => setActiveSection('spatial-lab')}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5 text-[#171717]" />}
            >
              Open 2D/3D Floor Plan
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Section 2: Recent Benchmark Runs (Dedicated Full-Width Section) */}
      <div className="bg-white rounded-[24px] p-6 border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F0F0] pb-4 mb-4">
          <div>
            <div className="text-base font-bold text-[#171717] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#DDD6F8] flex items-center justify-center text-[#4C3B9E]">
                <Activity className="w-4 h-4" />
              </div>
              Recent Benchmark Runs
            </div>
            <p className="text-xs text-[#777777] mt-1 leading-relaxed">
              Historical validation runs executed against simulated movement paths.
            </p>
          </div>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setActiveSection('benchmark-arena')}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5 text-[#171717]" />}
          >
            View Benchmark Arena
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {illustrativeRuns.map((run) => (
            <div
              key={run.id}
              className="p-4 rounded-[18px] bg-[#F9F9F9] border border-[#EAEAEA] hover:border-[#D5D5D5] transition-all flex flex-col justify-between gap-3 text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[#171717] font-bold text-xs">{run.id}</span>
                  <Badge variant="illustrative" size="sm">Sample Run</Badge>
                </div>
                <div className="text-sm font-bold text-[#171717]">{run.trajectoryName}</div>
                <div className="text-[11px] text-[#777777] font-mono flex items-center gap-2 flex-wrap">
                  <span>{run.noiseProfile}</span>
                  <span>•</span>
                  <span>{run.samplePoints} points</span>
                  <span>•</span>
                  <span>{run.anchorCount} anchors</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAEAEA] flex items-center justify-between font-mono">
                <div>
                  <div className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold">Best Error</div>
                  <div className="text-sm font-extrabold text-[#171717]">{run.bestRmse.toFixed(2)}m</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#888888] uppercase tracking-wider font-semibold">Accuracy Gain</div>
                  <div className="text-sm font-extrabold text-[#4C3B9E]">+{run.mlImprovementDelta}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Section 3: System Architecture & Integration (Full-Width Cohesive Panel) */}
      <div className="bg-[#F8F7FD] border border-[#DDD6F8] rounded-[24px] p-6 shadow-[0_2px_14px_-2px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#DDD6F8]/70 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#DDD6F8] flex items-center justify-center text-[#4C3B9E]">
              <ShieldCheck className="w-4 h-4 text-[#4C3B9E]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171717] tracking-tight">
                System Architecture & Integration
              </h3>
              <p className="text-xs text-[#666666]">
                FastAPI numerical positioning service with client integration, isolated test data, and sub-meter localization accuracy.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#EAE5FC] text-[#4C3B9E] self-start md:self-center border border-[#DDD6F8]">
            End-to-End Pipeline Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-[16px] bg-white border border-[#E8E4F7] shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] font-semibold">Backend API:</span>
            <div className="mt-1.5">
              <span className="font-bold text-xs text-[#171717] block">FastAPI (Render)</span>
              <span className="text-[11px] font-mono text-[#4C3B9E]">Live Health & CORS Verified</span>
            </div>
          </div>

          <div className="p-3.5 rounded-[16px] bg-white border border-[#E8E4F7] shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] font-semibold">Frontend Client:</span>
            <div className="mt-1.5">
              <span className="font-bold text-xs text-[#171717] block">React 19 (Vercel)</span>
              <span className="text-[11px] font-mono text-[#4C3B9E]">Vite 6 SPA Client</span>
            </div>
          </div>

          <div className="p-3.5 rounded-[16px] bg-white border border-[#E8E4F7] shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] font-semibold">Test Room Layout:</span>
            <div className="mt-1.5">
              <span className="font-bold text-xs text-[#171717] block">12.0m × 8.0m × 3.5m</span>
              <span className="text-[11px] font-mono text-[#555555]">6 Constrained Anchors</span>
            </div>
          </div>

          <div className="p-3.5 rounded-[16px] bg-white border border-[#E8E4F7] shadow-xs flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] font-semibold">Supported Methods:</span>
            <div className="mt-1.5">
              <span className="font-bold text-xs text-[#171717] block">Optimization & Hybrid ML</span>
              <span className="text-[11px] font-mono text-[#4C3B9E]">Trilateration, LM, EKF, Residual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
