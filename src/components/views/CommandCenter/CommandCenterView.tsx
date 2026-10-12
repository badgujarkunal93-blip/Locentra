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
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { SectionHeader } from '../../ui/SectionHeader';
import { MetricCard } from '../../ui/MetricCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';
import { SolverMetricSummary, BenchmarkRunSummary } from '../../../types/telemetry';

export const CommandCenterView: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setQuickRunModalOpen = useAppStore((s) => s.setQuickRunModalOpen);

  const [activeSolverFilter, setActiveSolverFilter] = useState<'all' | 'classical' | 'ml'>('all');

  // Illustrative benchmark summaries
  const illustrativeRuns: BenchmarkRunSummary[] = [
    {
      id: 'RUN-9402',
      timestamp: 'Today, 19:42:10',
      trajectoryName: 'Eight-Curve Dynamic Corridor',
      noiseProfile: 'AWGN σ=0.15m + 15% NLOS',
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
      trajectoryName: 'Rectangular Patrol Perimeter',
      noiseProfile: 'AWGN σ=0.10m (Ideal LOS)',
      anchorCount: 6,
      samplePoints: 350,
      bestAlgorithm: 'Levenberg-Marquardt NLLS',
      bestRmse: 0.18,
      mlImprovementDelta: -6.1,
      isIllustrative: true,
    },
    {
      id: 'RUN-9398',
      timestamp: 'Today, 16:50:04',
      trajectoryName: 'Random Walk with Anchor Dropout',
      noiseProfile: 'AWGN σ=0.25m + 30% Occlusion',
      anchorCount: 4,
      samplePoints: 600,
      bestAlgorithm: 'Extended Kalman Filter',
      bestRmse: 0.41,
      mlImprovementDelta: -19.2,
      isIllustrative: true,
    },
  ];

  // Illustrative algorithm comparison matrix
  const solverMetrics: SolverMetricSummary[] = [
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

  const filteredSolvers = solverMetrics.filter((s) => {
    if (activeSolverFilter === 'classical') return s.category !== 'Hybrid-ML';
    if (activeSolverFilter === 'ml') return s.category === 'Hybrid-ML';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Illustrative Notice Banner */}
      <div className="rounded-xl p-4 bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900/60 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-100">
                Phase 1 Prototype Shell & Design System
              </span>
              <Badge variant="illustrative" size="sm">
                Illustrative Metrics
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              All positioning metrics, solver accuracies and benchmark histories shown below are representative baseline models for UI verification. 
              Live Python numerical solvers (NLLS, EKF) and ML residual engines will be integrated in Phases 3, 4, and 5.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setActiveSection('spatial-lab')}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Explore Spatial Lab
          </Button>
        </div>
      </div>

      {/* Main Section Header */}
      <SectionHeader
        categoryTag="Mission Overview"
        phaseBadge="Phase 1 Active"
        title="Positioning Command Center"
        subtitle="Real-time multi-anchor telemetry, solver convergence diagnostics, and comparative accuracy tracking."
        actions={
          <div className="flex items-center gap-2.5">
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

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Root Mean Squared Error"
          value="0.28"
          unit="m"
          accent="mint"
          delta={{
            value: "-24.2%",
            isImprovement: true,
            label: "vs raw trilateration"
          }}
          confidenceInterval="[0.24, 0.33] m"
          icon={<Target className="w-4 h-4" />}
          trend={[0.48, 0.42, 0.38, 0.34, 0.30, 0.28]}
        />

        <MetricCard
          title="95th-Percentile Bound (P95)"
          value="0.58"
          unit="m"
          accent="cyan"
          delta={{
            value: "-0.57m",
            isImprovement: true,
            label: "maximum outlier bound"
          }}
          confidenceInterval="P99: 0.82m"
          icon={<BarChart2 className="w-4 h-4" />}
          trend={[1.15, 0.98, 0.85, 0.72, 0.62, 0.58]}
        />

        <MetricCard
          title="Solver Latency"
          value="1.42"
          unit="ms"
          accent="amber"
          delta={{
            value: "20.0 Hz",
            isImprovement: true,
            label: "real-time throughput"
          }}
          caption="EKF filter step execution"
          icon={<Zap className="w-4 h-4" />}
          trend={[1.8, 1.6, 1.5, 1.45, 1.42, 1.42]}
        />

        <MetricCard
          title="ML Residual Improvement"
          value="+18.7"
          unit="%"
          accent="violet"
          delta={{
            value: "σ -0.07m",
            isImprovement: true,
            label: "NLOS bias reduction"
          }}
          caption="Gradient Boosted Regressor"
          icon={<Sparkles className="w-4 h-4" />}
          trend={[5.0, 9.2, 12.4, 15.1, 17.5, 18.7]}
        />
      </div>

      {/* Two Column Layout: Solvers Matrix + Transceiver Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Comparative Solvers Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-emerald-900/30">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Localisation Algorithm Performance Matrix
                </CardTitle>
                <CardDescription>
                  Cross-algorithm evaluation on current scenario profile ({activeScenario.anchors.length} anchors, σ = 0.15m noise).
                </CardDescription>
              </div>

              <Tabs
                size="sm"
                options={[
                  { id: 'all', label: 'All Solvers' },
                  { id: 'classical', label: 'Classical' },
                  { id: 'ml', label: 'ML Augmented' },
                ]}
                activeId={activeSolverFilter}
                onChange={setActiveSolverFilter}
              />
            </CardHeader>

            {/* Solvers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-emerald-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Algorithm</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">RMSE (m)</th>
                    <th className="py-2.5 px-3 text-right">P95 Error</th>
                    <th className="py-2.5 px-3 text-right">Solve Time</th>
                    <th className="py-2.5 px-3 text-right">Convergence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSolvers.map((s) => {
                    const isMl = s.category === 'Hybrid-ML';
                    return (
                      <tr 
                        key={s.algorithmId} 
                        className={`hover:bg-slate-900/50 transition-colors ${
                          isMl ? 'bg-violet-950/10' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-medium text-slate-100 flex items-center gap-2">
                          {isMl ? (
                            <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_#a78bfa]" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                          )}
                          <span className="font-sans font-semibold text-slate-200">{s.algorithmName}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isMl
                                ? 'bg-violet-950/80 text-violet-300 border border-violet-500/30'
                                : 'bg-slate-800/80 text-slate-300'
                            }`}
                          >
                            {s.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">
                          {s.rmse.toFixed(2)} m
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {s.p95Error.toFixed(2)} m
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {s.solveLatencyMs.toFixed(2)} ms
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {s.convergenceRate.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Monte Carlo batch size: 1,000 synthetic iterations
              </span>
              <span className="font-mono text-emerald-400/80">
                Ground Truth Protected (Zero Data Leakage)
              </span>
            </div>
          </Card>

          {/* Recent Benchmark Runs */}
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <div>
                <CardTitle>
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Recent Benchmark Executions
                </CardTitle>
                <CardDescription>
                  Historical validation runs executed against unseen synthetic trajectories.
                </CardDescription>
              </div>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setActiveSection('benchmark-arena')}
                rightIcon={<ArrowUpRight className="w-3 h-3" />}
              >
                View Benchmark Arena
              </Button>
            </CardHeader>

            <div className="space-y-2.5">
              {illustrativeRuns.map((run) => (
                <div
                  key={run.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70 hover:border-emerald-800/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-semibold">{run.id}</span>
                      <span className="text-slate-200 font-semibold">{run.trajectoryName}</span>
                      <Badge variant="illustrative" size="sm">Mock</Badge>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                      <span>{run.noiseProfile}</span>
                      <span>•</span>
                      <span>{run.samplePoints} points</span>
                      <span>•</span>
                      <span>{run.anchorCount} anchors</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center font-mono">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Best RMSE</div>
                      <div className="text-sm font-bold text-emerald-300">{run.bestRmse.toFixed(2)}m</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">ML Gain</div>
                      <div className="text-sm font-bold text-violet-400">{run.mlImprovementDelta}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 span): Transceiver Status & Scenario Blueprint */}
        <div className="space-y-4">
          {/* Active Scenario Card */}
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <div>
                <CardTitle>
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Spatial Room Transceivers
                </CardTitle>
                <CardDescription>
                  {activeScenario.room.width}m x {activeScenario.room.length}m x {activeScenario.room.height}m Testbed
                </CardDescription>
              </div>
              <Badge variant="mint" size="sm">
                {activeScenario.anchors.length} Anchors
              </Badge>
            </CardHeader>

            <div className="space-y-2">
              {activeScenario.anchors.map((anchor) => (
                <div
                  key={anchor.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        anchor.status === 'healthy'
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                          : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                      }`}
                    />
                    <div>
                      <span className="font-semibold text-slate-200">{anchor.name}</span>
                      <div className="text-[10px] font-mono text-slate-400">
                        x: {anchor.x.toFixed(1)}m, y: {anchor.y.toFixed(1)}m, z: {anchor.z}m
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px]">
                    <span
                      className={
                        anchor.nlosProb > 0.3
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }
                    >
                      NLOS: {(anchor.nlosProb * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/70">
              <Button
                size="sm"
                variant="secondary"
                className="w-full justify-center"
                onClick={() => setActiveSection('spatial-lab')}
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Open 2D/3D Floor Plan
              </Button>
            </div>
          </Card>

          {/* Engine Lifecycle & Phase 1 Readiness Status */}
          <Card variant="forest" className="border-emerald-800/40">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-200">
                Phase 1 Execution Verified
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Design system, navigation rail, responsive layout tokens, and UI components are active and TypeScript checked.
            </p>
            <div className="mt-3.5 pt-3 border-t border-emerald-900/50 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Frontend Stack:</span>
                <span className="text-slate-200">React 19 + Tailwind v4</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>3D Readiness:</span>
                <span className="text-emerald-400">R3F + Drei Installed</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Next Milestone:</span>
                <span className="text-cyan-400">Phase 2 Spatial Lab</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
