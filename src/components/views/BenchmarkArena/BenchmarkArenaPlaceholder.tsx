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
      <div className={`rounded-[24px] p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] ${
        isBackend 
          ? 'border-[#D9F56F]'
          : 'border-[#EAEAEA]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isBackend ? 'bg-[#D9F56F] text-[#171717]' : 'bg-[#DDD6F8] text-[#4C3B9E]'
          }`}>
            {isBackend ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <Info className="w-5 h-5 shrink-0" />
            )}
          </div>
          <span className="text-[#555555]">
            {isBackend && compareData ? (
              <>
                <strong className="text-[#171717] font-bold">Live Numerical Benchmark:</strong> Real empirical comparison from FastAPI backend across <span className="font-mono font-bold text-[#171717]">{Object.keys(compareData.solvers).join(', ').toUpperCase()}</span> ({compareData.num_points} synthetic points, σ={effectiveNoise ?? 0.15}m noise).
              </>
            ) : (
              <>
                <strong className="text-[#171717] font-bold">Illustrative Benchmark Results:</strong> The CDF curves and metrics below are UI verification prototypes. Click &ldquo;Run Numerical Benchmark&rdquo; to execute the real Python solvers.
              </>
            )}
          </span>
        </div>
        <Badge variant={isBackend ? 'lime' : 'illustrative'} size="sm">
          {isBackend ? 'Live Python Suite' : 'Mock Benchmark'}
        </Badge>
      </div>

      {benchmarkState.status === 'error' && (
        <div className="rounded-[20px] p-4 bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>
            <strong className="font-bold">Benchmark Run Failed:</strong> {benchmarkState.error}
            <span className="text-rose-700 ml-1">Showing fallback illustrative model.</span>
          </div>
        </div>
      )}

      <SectionHeader
        categoryTag="Scientific Evaluation"
        phaseBadge={isBackend ? "Phase 5 Backend" : "Phase 4 Target"}
        title="Benchmark Arena & CDF Error Suite"
        subtitle="Rigorous empirical comparison of raw trilateration / WCL, non-linear least squares (LSQ), and kinematic extended Kalman filtering (EKF)."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>
                  <Cpu className="w-4 h-4 text-[#171717]" />
                  FastAPI Numerical Engine Comparison Metrics
                </CardTitle>
                <CardDescription>
                  Side-by-side empirical performance computed on {compareData.num_points} synthetic points
                </CardDescription>
              </div>
              <Badge variant="lime" size="sm">
                Synthetic Simulation (σ = {effectiveNoise ?? 0.15}m)
              </Badge>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F8F8F8] text-[#777777] border-b border-[#EAEAEA]">
                <tr>
                  <th className="py-3 px-4 font-bold">Algorithm</th>
                  <th className="py-3 px-4 font-bold">RMSE (m)</th>
                  <th className="py-3 px-4 font-bold">Mean Error (m)</th>
                  <th className="py-3 px-4 font-bold">Median Error (m)</th>
                  <th className="py-3 px-4 font-bold">P95 Error (m)</th>
                  <th className="py-3 px-4 font-bold">Valid Rate</th>
                  <th className="py-3 px-4 font-bold">Valid / Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] text-[#171717]">
                {Object.entries(compareData.solvers).map(([id, res]) => (
                  <tr key={id} className="hover:bg-[#F9F9F9]">
                    <td className="py-3 px-4 font-bold text-[#171717]">{res.name}</td>
                    <td className="py-3 px-4 font-bold text-[#171717]">{res.metrics.rmse_m !== null ? `${res.metrics.rmse_m.toFixed(3)} m` : 'N/A'}</td>
                    <td className="py-3 px-4 text-[#555555]">{res.metrics.mean_error_m !== null ? `${res.metrics.mean_error_m.toFixed(3)} m` : 'N/A'}</td>
                    <td className="py-3 px-4 text-[#555555]">{res.metrics.median_error_m !== null ? `${res.metrics.median_error_m.toFixed(3)} m` : 'N/A'}</td>
                    <td className="py-3 px-4 text-[#555555]">{res.metrics.p95_error_m !== null ? `${res.metrics.p95_error_m.toFixed(3)} m` : 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        res.metrics.valid_estimate_rate >= 0.95 ? 'bg-[#D9F56F] text-[#171717]' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {(res.metrics.valid_estimate_rate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#777777]">{res.metrics.valid_count} / {res.metrics.total_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Main Chart Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>
              <BarChart3 className="w-4 h-4 text-[#171717]" />
              Empirical Cumulative Distribution Function (CDF) of Positioning Error
            </CardTitle>
            <CardDescription>
              Fraction of test observations achieving localisation accuracy within specified error thresholds (m).
            </CardDescription>
          </div>
          <Badge variant={isBackend ? 'lime' : 'neutral'} size="sm">
            {isBackend && compareData ? `N = ${compareData.num_points} Points (Live)` : 'N = 1,000 Trajectories (Mock)'}
          </Badge>
        </CardHeader>

        {/* Recharts LineChart in Neo-minimalist Styling */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeCdfData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis 
                dataKey="errorMeters" 
                stroke="#C0C0C0" 
                tick={{ fill: '#777777', fontSize: 11 }}
                unit=" m"
              />
              <YAxis 
                stroke="#C0C0C0" 
                tick={{ fill: '#777777', fontSize: 11 }}
                domain={[0, 1]}
                tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderColor: '#EAEAEA',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                  color: '#171717',
                  fontWeight: '600',
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {isBackend ? (
                <>
                  <Line type="monotone" dataKey="Robust_NLS" name="Robust NLS" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Robust_NLS_Kalman" name="Robust NLS + Kalman" stroke="#171717" strokeWidth={3} dot={{ r: 3.5, fill: '#D9F56F' }} />
                  <Line type="monotone" dataKey="NLS" name="Standard NLS" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="NLS_Kalman" name="Standard NLS + Kalman" stroke="#B6A9EF" strokeWidth={2.5} dot={{ r: 3 }} />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="Trilateration" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="NLLS" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="EKF" stroke="#171717" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="HybridML" stroke="#B6A9EF" strokeWidth={3} dot={{ r: 4, fill: '#DDD6F8' }} strokeDasharray="4 2" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-[#F0F0F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] gap-2">
          <span>Steeper CDF slope represents tighter error bounds and superior positioning reliability.</span>
          <span className="font-mono text-[#171717] font-bold">
            {isBackend ? 'FastAPI Numerical Engine' : 'UI Verification Prototype'}
          </span>
        </div>
      </Card>
    </div>
  );
};
