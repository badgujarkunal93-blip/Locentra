import React from 'react';
import { 
  SlidersHorizontal, 
  Radio, 
  Cpu, 
  RotateCcw,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { SectionHeader } from '../../ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export const ScenarioStudioPlaceholder: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const updateScenario = useAppStore((s) => s.updateScenario);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const simulationState = useAppStore((s) => s.simulationState);
  const setSimulationConfig = useAppStore((s) => s.setSimulationConfig);
  const runBackendSimulation = useAppStore((s) => s.runBackendSimulation);
  const resetToDemoTrajectory = useAppStore((s) => s.resetToDemoTrajectory);
  const syncBackendConfig = useAppStore((s) => s.syncBackendConfig);

  const handleNoiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateScenario({ noiseStdDevMeters: parseFloat(e.target.value) });
  };

  const handleDropoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateScenario({ dropoutRate: parseFloat(e.target.value) });
  };

  const handleBiasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateScenario({ multipathBiasMeanMeters: parseFloat(e.target.value) });
  };

  const handleReset = () => {
    updateScenario({
      noiseStdDevMeters: 0.15,
      dropoutRate: 0.05,
      multipathBiasMeanMeters: 0.50,
    });
    setSimulationConfig({
      numPoints: 80,
      randomSeed: 42,
      trajectoryType: 'closed_loop',
      nlosRate: 0.10,
      selectedBackendSolver: 'robust_nls',
    });
  };

  const isRunning = simulationState.status === 'loading';

  const handleRunSimulation = async () => {
    if (isRunning) return;
    await runBackendSimulation();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SectionHeader
        categoryTag="Simulation Engine"
        phaseBadge="Phase 5 Live"
        title="Scenario Studio & Degradation Studio"
        subtitle="Configure physical measurement channel parameters and run the Python numerical positioning engine."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
              disabled={isRunning}
            >
              Reset Defaults
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => syncBackendConfig()}
              disabled={isRunning}
              title="Fetch canonical room & anchor configuration from FastAPI backend"
            >
              Sync Engine Config
            </Button>
            {simulationState.dataSource === 'backend' && (
              <Button
                size="sm"
                variant="secondary"
                onClick={resetToDemoTrajectory}
                disabled={isRunning}
              >
                Reset to Demo
              </Button>
            )}
            <Button
              size="sm"
              variant="primary"
              leftIcon={isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              onClick={handleRunSimulation}
              disabled={isRunning}
            >
              {isRunning ? 'Solving...' : 'Run Simulation on Engine'}
            </Button>
          </div>
        }
      />

      {/* Execution Status Feedback Banner */}
      {simulationState.status === 'loading' && (
        <div className="rounded-xl p-4 bg-cyan-950/40 border border-cyan-500/40 flex items-center gap-3 text-xs text-cyan-200">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />
          <div>
            <strong className="text-cyan-300 font-semibold">Running Python Simulation:</strong> Executing trajectory generation, synthetic range degradation, and {simulationState.selectedBackendSolver.toUpperCase()} solver in FastAPI backend...
          </div>
        </div>
      )}

      {simulationState.status === 'error' && (
        <div className="rounded-xl p-4 bg-rose-950/40 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-300 font-semibold">Backend Simulation Error:</strong> {simulationState.error}
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Ensure the FastAPI backend is running at <code className="bg-rose-900/40 px-1 py-0.5 rounded text-rose-200">http://127.0.0.1:8000</code> or check your network.
              </p>
            </div>
          </div>
          <Button
            size="xs"
            variant="outline"
            className="border-rose-500/40 text-rose-200 hover:bg-rose-900/30 shrink-0"
            onClick={resetToDemoTrajectory}
          >
            Use Demo Trajectory
          </Button>
        </div>
      )}

      {simulationState.status === 'success' && simulationState.lastRunResponse && (
        <div className="rounded-xl p-4 bg-emerald-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-emerald-300 font-semibold">Live Simulation Complete:</strong> Generated {simulationState.lastRunResponse.estimates.length} trajectory points. RMSE: <span className="font-mono font-bold text-emerald-300">{(simulationState.lastRunResponse.metrics.rmse_m ?? 0).toFixed(3)}m</span> | Valid rate: <span className="font-mono font-bold text-emerald-300">{(simulationState.lastRunResponse.metrics.valid_estimate_rate * 100).toFixed(0)}%</span> via <span className="font-mono font-bold">{simulationState.lastRunResponse.algorithm_name}</span>.
            </div>
          </div>
          <Button
            size="xs"
            variant="primary"
            rightIcon={<ArrowRight className="w-3 h-3" />}
            onClick={() => setActiveSection('spatial-lab')}
            className="shrink-0"
          >
            Inspect in Spatial Lab
          </Button>
        </div>
      )}

      {(simulationState?.validationErrors || []).length > 0 && (
        <div className="rounded-xl p-3 bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-1">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Validation Notice:
          </div>
          <ul className="list-disc list-inside text-[11px] text-amber-300/80">
            {simulationState.validationErrors?.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Channel & Solver Parameters */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <div>
                <CardTitle>
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  Stochastic Channel & Trajectory Parameters
                </CardTitle>
                <CardDescription>
                  Configure synthetic range measurement corruption and spatial trajectory limits
                </CardDescription>
              </div>
              <Badge variant={simulationState.dataSource === 'backend' ? 'mint' : 'illustrative'} size="sm">
                {simulationState.dataSource === 'backend' ? 'Live Backend Active' : 'Deterministic Demo'}
              </Badge>
            </CardHeader>

            <div className="space-y-6">
              {/* Solver & Trajectory Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Positioning Algorithm / Solver
                  </label>
                  <select
                    value={simulationState.selectedBackendSolver}
                    onChange={(e) => setSimulationConfig({ selectedBackendSolver: e.target.value as any })}
                    disabled={isRunning}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="robust_nls">Robust Non-Linear Least Squares (Huber / Levenberg-Marquardt)</option>
                    <option value="nls">Standard Non-Linear Least Squares (LSQ)</option>
                    <option value="robust_nls_kalman">Robust NLS + Kinematic Kalman Filter</option>
                    <option value="nls_kalman">Standard NLS + Kinematic Kalman Filter</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Trajectory Pattern
                  </label>
                  <select
                    value={simulationState.trajectoryType}
                    onChange={(e) => setSimulationConfig({ trajectoryType: e.target.value as 'closed_loop' | 'straight_line' | 'curved' })}
                    disabled={isRunning}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value="closed_loop">Closed Loop (Rectangular Patrol)</option>
                    <option value="straight_line">Straight Line (Diagonal Transit)</option>
                    <option value="curved">Curved Path (Smooth Spline)</option>
                  </select>
                </div>
              </div>

              {/* Number of Points & Random Seed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">Trajectory Points</span>
                    <span className="font-mono text-cyan-400 font-bold">{simulationState.numPoints} points</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={simulationState.numPoints}
                    onChange={(e) => setSimulationConfig({ numPoints: parseInt(e.target.value, 10) })}
                    disabled={isRunning}
                    className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>10 pts (Fast)</span>
                    <span>60 pts (Standard)</span>
                    <span>300 pts (Dense)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">Simulation Random Seed</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {simulationState.randomSeed !== null ? `Seed: ${simulationState.randomSeed}` : 'Non-deterministic'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="2147483647"
                      value={simulationState.randomSeed ?? ''}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value, 10);
                        setSimulationConfig({ randomSeed: isNaN(parsed) ? 42 : parsed });
                      }}
                      placeholder="e.g. 42"
                      disabled={isRunning}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => setSimulationConfig({ randomSeed: Math.floor(Math.random() * 10000) })}
                      disabled={isRunning}
                      className="shrink-0"
                    >
                      Randomize
                    </Button>
                  </div>
                </div>
              </div>

              {/* Noise Std Dev */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    Gaussian Range Noise (AWGN)
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    σ = {activeScenario.noiseStdDevMeters.toFixed(2)} m
                  </span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.80"
                  step="0.01"
                  value={activeScenario.noiseStdDevMeters}
                  onChange={handleNoiseChange}
                  disabled={isRunning}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>0.01 m (Lab UWB)</span>
                  <span>0.40 m (Noisy Industrial)</span>
                  <span>0.80 m (Severe Multipath)</span>
                </div>
              </div>

              {/* Dropout Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    Intermittent Packet Dropout / Missing Observations
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {(activeScenario.dropoutRate * 100).toFixed(0)} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.50"
                  step="0.01"
                  value={activeScenario.dropoutRate}
                  onChange={handleDropoutChange}
                  disabled={isRunning}
                  className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>0% (Full Stream)</span>
                  <span>25% (Sporadic Dropout)</span>
                  <span>50% (High Dropout)</span>
                </div>
              </div>

              {/* NLOS Positive Bias */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    Non-Line-of-Sight (NLOS) Exponential Bias & Probability
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {(simulationState.nlosRate * 100).toFixed(0)}% rate | μ = +{activeScenario.multipathBiasMeanMeters.toFixed(2)} m
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">NLOS Occurrence Probability</label>
                    <input
                      type="range"
                      min="0.00"
                      max="0.60"
                      step="0.05"
                      value={simulationState.nlosRate}
                      onChange={(e) => setSimulationConfig({ nlosRate: parseFloat(e.target.value) })}
                      disabled={isRunning}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Mean Positive Shift (μ)</label>
                    <input
                      type="range"
                      min="0.00"
                      max="1.50"
                      step="0.05"
                      value={activeScenario.multipathBiasMeanMeters}
                      onChange={handleBiasChange}
                      disabled={isRunning}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Transceivers Grid */}
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <div>
                <CardTitle>
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Anchor Transceiver Constellation
                </CardTitle>
                <CardDescription>
                  Active anchor nodes synchronized with backend geometry (12m × 8m room).
                </CardDescription>
              </div>
              <Badge variant="cyan" size="sm">
                6 Canonical Nodes
              </Badge>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeScenario.anchors.map((anchor) => (
                <div
                  key={anchor.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-200">{anchor.id}</span>
                    <p className="text-[10px] text-slate-400 truncate">({anchor.x}m, {anchor.y}m, {anchor.z}m)</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Schema Preview & Engine Metadata */}
        <div className="space-y-4">
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <CardTitle>
                <Cpu className="w-4 h-4 text-emerald-400" />
                Live Request Contract
              </CardTitle>
              <Badge variant="mint" size="sm">
                POST /api/v1/simulations/run
              </Badge>
            </CardHeader>

            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-emerald-400/90 overflow-x-auto">
{JSON.stringify({
  solver: simulationState.selectedBackendSolver,
  trajectory_type: simulationState.trajectoryType,
  num_points: simulationState.numPoints,
  noise_std_dev: activeScenario.noiseStdDevMeters,
  dropout_rate: activeScenario.dropoutRate,
  nlos_rate: simulationState.nlosRate,
  nlos_bias_mean: activeScenario.multipathBiasMeanMeters,
  seed: simulationState.randomSeed,
}, null, 2)}
            </pre>
            <p className="text-[11px] text-slate-400 mt-2">
              Dispatched directly to the FastAPI positioning service.
            </p>
          </Card>

          <Card variant="forest" className="border-emerald-800/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-200">
                Phase 5 Numerical Integration
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When triggered, the backend generates ground truth coordinates, corrupts range measurements with physical noise and NLOS biases, and executes the selected mathematical solver. Results update the 2D & 3D Spatial Lab immediately.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
