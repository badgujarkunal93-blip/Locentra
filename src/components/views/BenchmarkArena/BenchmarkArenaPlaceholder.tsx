import React, { useState } from 'react';
import { 
  BarChart3, 
  Info,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { SectionHeader } from '../../ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { MetricCard } from '../../ui/MetricCard';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';

export const BenchmarkArenaPlaceholder: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<'cdf' | 'boxplots' | 'monte-carlo'>('cdf');

  // Illustrative CDF data for visualization
  const cdfData = [
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Illustrative Notice */}
      <div className="rounded-xl p-3.5 bg-slate-900/80 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300">
            <strong className="text-amber-300">Illustrative Benchmark Results:</strong> The CDF curves and error distributions below are UI verification prototypes. Real Python evaluation curves will be generated in Phase 4.
          </span>
        </div>
        <Badge variant="illustrative" size="sm">Mock Benchmark</Badge>
      </div>

      <SectionHeader
        categoryTag="Scientific Evaluation"
        phaseBadge="Phase 4 Target"
        title="Benchmark Arena & CDF Error Suite"
        subtitle="Rigorous empirical comparison of raw trilateration, non-linear least squares, kinematic extended Kalman filtering, and ML residual calibration."
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
              variant="secondary"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => alert('Phase 4 benchmark runner will execute 1,000 synthetic trials via Python.')}
            >
              Re-run Suite
            </Button>
          </div>
        }
      />

      {/* Metric Highlights */}
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
          <Badge variant="cyan" size="sm">
            N = 1,000 Evaluation Trajectories
          </Badge>
        </CardHeader>

        {/* Recharts LineChart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cdfData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
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
              <Line type="monotone" dataKey="Trilateration" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="NLLS" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="EKF" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="HybridML" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Steeper CDF slope represents tighter error bounds and superior positioning reliability.</span>
          <span className="font-mono text-emerald-400">P90 Target: &lt; 0.35m</span>
        </div>
      </Card>
    </div>
  );
};
