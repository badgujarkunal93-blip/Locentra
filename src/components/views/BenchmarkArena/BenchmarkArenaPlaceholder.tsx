import React, { useState } from 'react';
import { 
  BarChart3, 
  Info,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useAppStore } from '../../../store/useAppStore';
import { SectionHeader } from '../../ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { MetricCard } from '../../ui/MetricCard';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';

export const BenchmarkArenaPlaceholder: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'cdf' | 'boxplots' | 'monte-carlo'>('cdf');

  const benchmarkState = useAppStore((s) => s.benchmarkState);
  const runBackendBenchmark = useAppStore((s) => s.runBackendBenchmark);

  const isRunning = benchmarkState.status === 'loading';
  const isBackend = benchmarkState.dataSource === 'backend' && benchmarkState.lastCompareResponse !== null;
  const compareData = benchmarkState.lastCompareResponse;

  const handleRunSuite = async () => {
    if (isRunning) return;
    await runBackendBenchmark();
  };

  // Illustrative CDF fallback data for prototype visualization
  const mockCdfData = [
    { errorMeters: '0.05', Trilateration: 0.05, NLLS: 0.15, EKF: 0.22, HybridML: 0.32 },
    { errorMeters: '0.10', Trilateration: 0.12, NLLS: 0.32, EKF: 0.44, HybridML: 0.60 },
    { errorMeters: '0.15', Trilateration: 0.22, NLLS: 0.50, EKF: 0.65, HybridML: 0.82 },
    { errorMeters: '0.20', Trilateration: 0.34, NLLS: 0.68, EKF: 0.81, HybridML: 0.94 },
    { errorMeters: '0.30', Trilateration: 0.52, NLLS: 0.85, EKF: 0.92, HybridML: 0.98 },
    { errorMeters: '0.40', Trilateration: 0.68, NLLS: 0.93, EKF: 0.97, HybridML: 0.99 },
    { errorMeters: '0.50', Trilateration: 0.80, NLLS: 0.97, EKF: 0.99, HybridML: 1.00 },
    { errorMeters: '0.70', Trilateration: 0.92, NLLS: 0.99, EKF: 1.00, HybridML: 1.00 },
    { errorMeters: '1.00', Trilateration: 0.98, NLLS: 1.00, EKF: 1.00, HybridML: 1.00 },
  ];

  // If real backend comparison data exists, construct genuine empirical CDF from actual solver errors
  const activeCdfData = (isBackend && compareData) ? (() => {
    const { ground_truth, solvers } = compareData;
    if (!ground_truth || ground_truth.length === 0 || !solvers) return mockCdfData;

    const errorsBySolver: Record<string, number[]> = {};
    let maxObservedError = 0.5;

    Object.entries(solvers).forEach(([key, s]) => {
      const errs: number[] = [];
      s.estimates.forEach((est, idx) => {
        const gt = ground_truth[idx];
        if (est && est.status === 'valid' && est.x !== null && est.y !== null && gt) {
          const d = Math.hypot(est.x - gt.x, est.y - gt.y);
          errs.push(d);
          if (d > maxObservedError) maxObservedError = d;
        }
      });
      errs.sort((a, b) => a - b);
      errorsBySolver[key] = errs;
    });

    const ceiling = Math.min(Math.max(maxObservedError, 0.5), 3.0);
    const steps = 15;
    const grid: number[] = [0];
    for (let step = 1; step <= steps; step++) {
      grid.push(Number(((ceiling * step) / steps).toFixed(2)));
    }

    return grid.map((thresh) => {
      const point: Record<string, number | string> = {
        errorMeters: thresh.toFixed(2),
      };

      if (errorsBySolver['robust_nls']) {
        const arr = errorsBySolver['robust_nls'];
        point.Robust_NLS = arr.length > 0 ? Number((arr.filter(e => e <= thresh).length / arr.length).toFixed(3)) : 0;
      }
      if (errorsBySolver['robust_nls_kalman']) {
        const arr = errorsBySolver['robust_nls_kalman'];
        point.Robust_NLS_Kalman = arr.length > 0 ? Number((arr.filter(e => e <= thresh).length / arr.length).toFixed(3)) : 0;
      }
      if (errorsBySolver['nls']) {
        const arr = errorsBySolver['nls'];
        point.NLS = arr.length > 0 ? Number((arr.filter(e => e <= thresh).length / arr.length).toFixed(3)) : 0;
      }
      if (errorsBySolver['nls_kalman']) {
        const arr = errorsBySolver['nls_kalman'];
        point.NLS_Kalman = arr.length > 0 ? Number((arr.filter(e => e <= thresh).length / arr.length).toFixed(3)) : 0;
      }

      return point;
    });
  })() : mockCdfData;

  const effectiveNoise = compareData?.effective_config?.noise_std_dev as number | undefined;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Notice & State Banner */}
      <div className={`rounded-xl p-3.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        isBackend 
          ? 'bg-slate-900/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
          : 'bg-slate-900/80 border-amber-500/40'
      }`}>
        <div className="flex items-center gap-2.5">
          {isBackend ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="text-slate-300">
            {isBackend && compareData ? (
              <>
                <strong className="text-emerald-300">Live Numerical Benchmark:</strong> Real empirical comparison from FastAPI backend across <span className="font-mono font-bold text-emerald-200">{Object.keys(compareData.solvers).join(', ').toUpperCase()}</span> ({compareData.num_points} synthetic points, σ={effectiveNoise ?? 0.15}m noise).
              </>
            ) : (
              <>
                <strong className="text-amber-300">Illustrative Benchmark Results:</strong> The CDF curves and metrics below are UI verification prototypes. Click &ldquo;Run Numerical Benchmark&rdquo; to execute the real Python solvers.
              </>
            )}
          </span>
        </div>
        <Badge variant={isBackend ? 'mint' : 'illustrative'} size="sm">
          {isBackend ? 'Live Python Suite' : 'Mock Benchmark'}
        </Badge>
      </div>

      {benchmarkState.status === 'error' && (
        <div className="rounded-xl p-3.5 bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <strong className="text-rose-300 font-semibold">Benchmark Run Failed:</strong> {benchmarkState.error}
            <span className="text-rose-300/80 ml-1">Showing fallback illustrative model.</span>
          </div>
        </div>
      )}

      <SectionHeader
        categoryTag="Scientific Evaluation"
        phaseBadge={isBackend ? "Phase 5 Backend" : "Phase 4 Target"}
        title="Benchmark Arena & CDF Error Suite"
        subtitle="Rigorous empirical comparison of raw trilateration / WCL, non-linear least squares (LSQ), and kinematic extended Kalman filtering (EKF)."
        actions={
          <div className="flex items-center gap-2.5">
            <Tabs
              size="sm"
              options={[
                { id: 'cdf', label: 'Cumulative Error CDF' },
                { id: 'boxplots', label: 'Error Quantiles' },
                { id: 'monte-carlo', label: 'Monte Carlo Batches' },
              ]}
              activeId={selectedMetric}
              onChange={setSelectedMetric}
            />
            <Button
              size="sm"
              variant="primary"
              leftIcon={isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleRunSuite}
              disabled={isRunning}
            >
              {isRunning ? 'Running Benchmark...' : 'Run Numerical Benchmark'}
            </Button>
          </div>
        }
      />

      {/* Metric Highlights */}
      {isBackend && compareData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(compareData.solvers).map(([solverId, res]) => {
            const accentColor = 
              solverId.includes('kalman') ? 'mint' :
              solverId.includes('robust') ? 'cyan' : 'amber';
            const rmseVal = res.metrics.rmse_m !== null ? `${res.metrics.rmse_m.toFixed(3)}` : 'N/A';
            const validRateVal = `${(res.metrics.valid_estimate_rate * 100).toFixed(0)}%`;
            const medianVal = res.metrics.median_error_m !== null ? `${res.metrics.median_error_m.toFixed(3)}m` : 'N/A';
            const p95Val = res.metrics.p95_error_m !== null ? `${res.metrics.p95_error_m.toFixed(3)}m` : 'N/A';

            return (
              <MetricCard
                key={solverId}
                title={res.name}
                value={rmseVal}
                unit="m RMSE"
                accent={accentColor}
                delta={{
                  value: validRateVal,
                  isImprovement: res.metrics.valid_estimate_rate > 0.9,
                  label: "valid estimates"
                }}
                confidenceInterval={`Median: ${medianVal} | P95: ${p95Val}`}
              />
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Baseline Trilateration"
            value="0.58"
            unit="m"
            accent="amber"
            delta={{ value: "Baseline", isImprovement: false, label: "raw geometric" }}
            confidenceInterval="Median: 0.42m"
          />
          <MetricCard
            title="Levenberg-Marquardt NLLS"
            value="0.34"
            unit="m"
            accent="cyan"
            delta={{ value: "-41.3%", isImprovement: true, label: "vs trilat" }}
            confidenceInterval="Median: 0.24m"
          />
          <MetricCard
            title="Extended Kalman Filter"
            value="0.28"
            unit="m"
            accent="mint"
            delta={{ value: "-51.7%", isImprovement: true, label: "vs trilat" }}
            confidenceInterval="Median: 0.18m"
          />
          <MetricCard
            title="Hybrid ML Residual"
            value="0.21"
            unit="m"
            accent="violet"
            delta={{ value: "-63.8%", isImprovement: true, label: "vs trilat" }}
            confidenceInterval="Median: 0.13m"
          />
        </div>
      )}

      {/* Numerical Comparison Table when Backend Data is Available */}
      {isBackend && compareData && (
        <Card className="border border-emerald-900/30">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  FastAPI Numerical Engine Comparison Metrics
                </CardTitle>
                <CardDescription>
                  Side-by-side empirical performance computed on {compareData.num_points} synthetic points
                </CardDescription>
              </div>
              <Badge variant="mint" size="sm">
                Synthetic Simulation (σ = {effectiveNoise ?? 0.15}m)
              </Badge>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Algorithm</th>
                  <th className="py-2.5 px-4 font-semibold">RMSE (m)</th>
                  <th className="py-2.5 px-4 font-semibold">Mean Error (m)</th>
                  <th className="py-2.5 px-4 font-semibold">Median Error (m)</th>
                  <th className="py-2.5 px-4 font-semibold">P95 Error (m)</th>
                  <th className="py-2.5 px-4 font-semibold">Valid Rate</th>
                  <th className="py-2.5 px-4 font-semibold">Valid / Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {Object.entries(compareData.solvers).map(([id, res]) => (
                  <tr key={id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-4 font-bold text-emerald-300">{res.name}</td>
                    <td className="py-2.5 px-4">{res.metrics.rmse_m !== null ? `${res.metrics.rmse_m.toFixed(3)} m` : 'N/A'}</td>
                    <td className="py-2.5 px-4">{res.metrics.mean_error_m !== null ? `${res.metrics.mean_error_m.toFixed(3)} m` : 'N/A'}</td>
                    <td className="py-2.5 px-4">{res.metrics.median_error_m !== null ? `${res.metrics.median_error_m.toFixed(3)} m` : 'N/A'}</td>
                    <td className="py-2.5 px-4">{res.metrics.p95_error_m !== null ? `${res.metrics.p95_error_m.toFixed(3)} m` : 'N/A'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        res.metrics.valid_estimate_rate >= 0.95 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50' : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      }`}>
                        {(res.metrics.valid_estimate_rate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{res.metrics.valid_count} / {res.metrics.total_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Main Chart Card */}
      <Card className="border border-emerald-900/30">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Empirical Cumulative Distribution Function (CDF) of Positioning Error
            </CardTitle>
            <CardDescription>
              Fraction of test observations achieving localisation accuracy within specified error thresholds (m).
            </CardDescription>
          </div>
          <Badge variant={isBackend ? 'mint' : 'cyan'} size="sm">
            {isBackend && compareData ? `N = ${compareData.num_points} Points (Live)` : 'N = 1,000 Trajectories (Mock)'}
          </Badge>
        </CardHeader>

        {/* Recharts LineChart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeCdfData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#162e26" />
              <XAxis 
                dataKey="errorMeters" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit=" m"
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={[0, 1]}
                tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#091113', 
                  borderColor: '#1f483c',
                  borderRadius: '0.75rem',
                  fontSize: '12px' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {isBackend ? (
                <>
                  <Line type="monotone" dataKey="Robust_NLS" name="Robust NLS" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Robust_NLS_Kalman" name="Robust NLS + Kalman" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="NLS" name="Standard NLS" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="NLS_Kalman" name="Standard NLS + Kalman" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="Trilateration" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="NLLS" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="EKF" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="HybridML" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="4 2" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Steeper CDF slope represents tighter error bounds and superior positioning reliability.</span>
          <span className="font-mono text-emerald-400">
            {isBackend ? 'FastAPI Numerical Engine' : 'UI Verification Prototype'}
          </span>
        </div>
      </Card>
    </div>
  );
};
