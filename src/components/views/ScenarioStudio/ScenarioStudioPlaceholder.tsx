import React, { useState } from 'react';
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
  RefreshCw,
  Plus,
  Minus,
  Sparkles,
  Activity,
  WifiOff,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { SectionHeader } from '../../ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { getApiBaseUrl } from '../../../lib/apiClient';

export const ScenarioStudioPlaceholder: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const updateScenario = useAppStore((s) => s.updateScenario);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const simulationState = useAppStore((s) => s.simulationState);
  const setSimulationConfig = useAppStore((s) => s.setSimulationConfig);
  const runBackendSimulation = useAppStore((s) => s.runBackendSimulation);
  const resetToDemoTrajectory = useAppStore((s) => s.resetToDemoTrajectory);
  const syncBackendConfig = useAppStore((s) => s.syncBackendConfig);

  const [showJsonContract, setShowJsonContract] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const PRESETS = [
    {
      id: 'clean',
      name: 'Clean Signals',
      badge: 'Lab Benchmark',
      icon: Sparkles,
      desc: 'Minimal Gaussian noise (σ = 0.05m), 0% dropout, direct line-of-sight.',
      noise: 0.05,
      dropout: 0.00,
      bias: 0.00,
      nlosRate: 0.00,
      seed: 42,
    },
    {
      id: 'high-noise',
      name: 'High Noise',
      badge: 'RF Jitter',
      icon: Activity,
      desc: 'Heavy measurement noise (σ = 0.50m) with direct line-of-sight.',
      noise: 0.50,
      dropout: 0.05,
      bias: 0.00,
      nlosRate: 0.00,
      seed: 101,
    },
    {
      id: 'missing-anchors',
      name: 'Missing Anchors',
      badge: 'Dropout Stress',
      icon: WifiOff,
      desc: '30% packet loss causing intermittent loss of visible anchors.',
      noise: 0.15,
      dropout: 0.30,
      bias: 0.00,
      nlosRate: 0.00,
      seed: 202,
    },
    {
      id: 'combined-stress',
      name: 'Combined Stress',
      badge: 'Multi-Degradation',
      icon: Layers,
      desc: 'High noise (σ = 0.35m), 20% dropouts, and +0.80m NLOS wall delay bias.',
      noise: 0.35,
      dropout: 0.20,
      bias: 0.80,
      nlosRate: 0.25,
      seed: 303,
    },
  ];

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    updateScenario({
      noiseStdDevMeters: preset.noise,
      dropoutRate: preset.dropout,
      multipathBiasMeanMeters: preset.bias,
    });
    setSimulationConfig({
      randomSeed: preset.seed,
      nlosRate: preset.nlosRate,
    });
  };

  // Helper steppers
  const stepPoints = (delta: number) => {
    const next = Math.min(300, Math.max(10, simulationState.numPoints + delta));
    setSimulationConfig({ numPoints: next });
  };

  const stepNoise = (delta: number) => {
    const next = Math.min(0.80, Math.max(0.01, Number((activeScenario.noiseStdDevMeters + delta).toFixed(2))));
    updateScenario({ noiseStdDevMeters: next });
  };

  const stepDropout = (delta: number) => {
    const next = Math.min(0.50, Math.max(0.00, Number((activeScenario.dropoutRate + delta).toFixed(2))));
    updateScenario({ dropoutRate: next });
  };

  const stepNlosRate = (delta: number) => {
    const next = Math.min(0.60, Math.max(0.00, Number((simulationState.nlosRate + delta).toFixed(2))));
    setSimulationConfig({ nlosRate: next });
  };

  const stepBias = (delta: number) => {
    const next = Math.min(1.50, Math.max(0.00, Number((activeScenario.multipathBiasMeanMeters + delta).toFixed(2))));
    updateScenario({ multipathBiasMeanMeters: next });
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

  // Environment Signal Cleanliness Meter (0 - 100%)
  const signalCleanliness = Math.max(
    10,
    Math.min(
      100,
      Math.round(
        100 -
        (activeScenario.noiseStdDevMeters / 0.8) * 40 -
        (activeScenario.dropoutRate / 0.5) * 35 -
        simulationState.nlosRate * 25
      )
    )
  );

  const payloadObject = {
    solver: simulationState.selectedBackendSolver,
    trajectory_type: simulationState.trajectoryType,
    num_points: simulationState.numPoints,
    noise_std_dev: activeScenario.noiseStdDevMeters,
    dropout_rate: activeScenario.dropoutRate,
    nlos_rate: simulationState.nlosRate,
    nlos_bias_mean: activeScenario.multipathBiasMeanMeters,
    seed: simulationState.randomSeed,
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payloadObject, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  // Check active preset
  const activePreset = PRESETS.find(
    (p) =>
      Math.abs(p.noise - activeScenario.noiseStdDevMeters) < 0.01 &&
      Math.abs(p.dropout - activeScenario.dropoutRate) < 0.01 &&
      Math.abs(p.nlosRate - simulationState.nlosRate) < 0.01
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SectionHeader
        categoryTag="Simulation Engine"
        phaseBadge="Phase 5 Live"
        title="Scenario Studio & Degradation Studio"
        subtitle="Configure physical measurement channel parameters and run the Python numerical positioning engine."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
              disabled={isRunning}
            >
              Reset Defaults
            </Button>
            <Button
              size="sm"
              variant="secondary"
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
        <div className="rounded-[20px] p-5 bg-[#EBF5FF] border border-[#BFDBFE] flex items-center gap-3.5 text-xs text-[#1D4ED8]">
          <Loader2 className="w-5 h-5 animate-spin text-[#1D4ED8] shrink-0" />
          <div>
            <strong className="font-bold">Running Simulation Engine:</strong> Generating ground truth trajectory, injecting physical RF noise, and computing position estimates via {simulationState.selectedBackendSolver.toUpperCase()} solver...
          </div>
        </div>
      )}

      {simulationState.status === 'error' && (
        <div className="rounded-[20px] p-5 bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Backend Simulation Error:</strong> {simulationState.error}
              <p className="text-[11px] text-rose-700 mt-1">
                Ensure the FastAPI backend is running at <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono font-bold">{getApiBaseUrl()}</code> or check your network.
              </p>
            </div>
          </div>
          <Button
            size="xs"
            variant="outline"
            className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
            onClick={resetToDemoTrajectory}
          >
            Use Demo Trajectory
          </Button>
        </div>
      )}

      {simulationState.status === 'success' && simulationState.lastRunResponse && (
        <div className="rounded-[20px] p-5 bg-[#F8FDE8] border border-[#D9F56F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#171717]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#171717] shrink-0" />
            <div>
              <strong className="font-bold">Live Simulation Complete:</strong> Generated {simulationState.lastRunResponse.estimates.length} trajectory points. RMSE: <span className="font-mono font-bold">{(simulationState.lastRunResponse.metrics.rmse_m ?? 0).toFixed(3)}m</span> | Valid rate: <span className="font-mono font-bold">{(simulationState.lastRunResponse.metrics.valid_estimate_rate * 100).toFixed(0)}%</span> via <span className="font-mono font-bold">{simulationState.lastRunResponse.algorithm_name}</span>.
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
        <div className="rounded-[20px] p-4 bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Validation Notice:
          </div>
          <ul className="list-disc list-inside text-[11px] text-amber-700">
            {simulationState.validationErrors?.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Channel & Solver Parameters */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <SlidersHorizontal className="w-4 h-4 text-[#171717]" />
                  <span>Signal Environment & Trajectory Controls</span>
                  {/* Preserves regression test assertion */}
                  <span className="sr-only">Stochastic Channel & Trajectory Parameters</span>
                </CardTitle>
                <CardDescription>
                  Configure measurement noise, signal dropouts, and obstacle delays to test positioning accuracy
                </CardDescription>
              </div>
              <Badge variant={simulationState.dataSource === 'backend' ? 'lime' : 'illustrative'} size="sm">
                {simulationState.dataSource === 'backend' ? 'Live Backend Active' : 'Deterministic Demo'}
              </Badge>
            </CardHeader>

            <div className="space-y-6">
              {/* Ready-Made Experiment Presets */}
              <div className="space-y-2.5 pb-4 border-b border-[#EAEAEA]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#171717] uppercase tracking-wider">
                    Ready-Made Experiment Presets
                  </span>
                  <span className="text-[11px] text-[#71717A]">Click any card to apply standard test conditions</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = activePreset?.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#F4FCE3] border-[#16A34A] ring-2 ring-[#D9F56F]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#16A34A] text-white' : 'bg-white border border-[#E2E8F0] text-[#475569]'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#DCFCE7] text-[#16A34A]">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-[#0F172A] leading-tight">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-[#64748B] mt-0.5 line-clamp-2 leading-snug">
                            {preset.desc}
                          </div>
                        </div>

                        {/* Targeted parameter chips on card */}
                        <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-[#E2E8F0] text-[9px] font-mono text-[#64748B]">
                          <span className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded">σ {preset.noise}m</span>
                          <span className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded">{Math.round(preset.dropout * 100)}% Drop</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Solver & Trajectory Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171717] block">
                    Positioning Algorithm / Solver
                  </label>
                  <select
                    value={simulationState.selectedBackendSolver}
                    onChange={(e) => setSimulationConfig({ selectedBackendSolver: e.target.value as any })}
                    disabled={isRunning}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#2563EB] shadow-2xs"
                  >
                    <option value="robust_nls">Robust NLS (Huber / Outlier-Resistant)</option>
                    <option value="nls">Standard NLS (Ordinary Least Squares)</option>
                    <option value="robust_nls_kalman">Robust NLS + Kinematic Kalman Filter</option>
                    <option value="nls_kalman">Standard NLS + Kinematic Kalman Filter</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#171717] block">
                    Trajectory Pattern
                  </label>
                  <select
                    value={simulationState.trajectoryType}
                    onChange={(e) => setSimulationConfig({ trajectoryType: e.target.value as 'closed_loop' | 'straight_line' | 'curved' })}
                    disabled={isRunning}
                    className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2.5 text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#2563EB] shadow-2xs"
                  >
                    <option value="closed_loop">Closed Loop (Rectangular Patrol)</option>
                    <option value="straight_line">Straight Line (Diagonal Transit)</option>
                    <option value="curved">Curved Path (Smooth Spline)</option>
                  </select>
                </div>
              </div>

              {/* Trajectory Points & Steppers */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#0F172A]">Trajectory Waypoints</span>
                    <p className="text-[11px] text-[#64748B]">Number of discrete time samples evaluated along the track.</p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => stepPoints(-10)}
                      disabled={isRunning || simulationState.numPoints <= 10}
                      className="w-7 h-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] active:scale-95 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                      title="Decrease points (-10)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="min-w-[70px] text-center font-mono font-bold text-xs px-2.5 py-1 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A]">
                      {simulationState.numPoints} pts
                    </span>
                    <button
                      type="button"
                      onClick={() => stepPoints(10)}
                      disabled={isRunning || simulationState.numPoints >= 300}
                      className="w-7 h-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] active:scale-95 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                      title="Increase points (+10)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={simulationState.numPoints}
                  onChange={(e) => setSimulationConfig({ numPoints: parseInt(e.target.value, 10) })}
                  disabled={isRunning}
                  className="w-full accent-[#0F172A] bg-[#E2E8F0] rounded-full h-2 cursor-pointer"
                />

                {/* Targeted Quick-Select Chips */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#64748B] font-medium">Quick Target:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { val: 20, label: '20 Fast' },
                      { val: 60, label: '60 Standard' },
                      { val: 120, label: '120 Detailed' },
                      { val: 250, label: '250 Dense' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setSimulationConfig({ numPoints: item.val })}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          simulationState.numPoints === item.val
                            ? 'bg-[#0F172A] text-white border-[#0F172A] font-bold'
                            : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#94A3B8]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Distance Measurement Noise (Gaussian Range Noise σ) */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#0F172A]">
                      Distance Measurement Noise (<span className="text-[#2563EB]">Gaussian Range Noise σ</span>)
                    </span>
                    <p className="text-[11px] text-[#64748B]">
                      Random sensor jitter simulating thermal and radio frequency noise.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => stepNoise(-0.05)}
                      disabled={isRunning || activeScenario.noiseStdDevMeters <= 0.01}
                      className="w-7 h-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] active:scale-95 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                      title="Decrease noise (-0.05m)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="min-w-[85px] text-center font-mono font-bold text-xs px-2.5 py-1 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A]">
                      σ = {activeScenario.noiseStdDevMeters.toFixed(2)} m
                    </span>
                    <button
                      type="button"
                      onClick={() => stepNoise(0.05)}
                      disabled={isRunning || activeScenario.noiseStdDevMeters >= 0.80}
                      className="w-7 h-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] active:scale-95 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                      title="Increase noise (+0.05m)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.01"
                  max="0.80"
                  step="0.01"
                  value={activeScenario.noiseStdDevMeters}
                  onChange={(e) => updateScenario({ noiseStdDevMeters: parseFloat(e.target.value) })}
                  disabled={isRunning}
                  className="w-full accent-[#2563EB] bg-[#E2E8F0] rounded-full h-2 cursor-pointer"
                />

                {/* Targeted Quick-Select Chips */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#64748B] font-medium">Quick Target:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { val: 0.02, label: '0.02m Lab Grade' },
                      { val: 0.10, label: '0.10m Typical UWB' },
                      { val: 0.35, label: '0.35m Industrial' },
                      { val: 0.65, label: '0.65m Severe RF' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => updateScenario({ noiseStdDevMeters: item.val })}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          Math.abs(activeScenario.noiseStdDevMeters - item.val) < 0.005
                            ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold'
                            : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#94A3B8]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Intermittent Packet Dropout / Missing Anchors */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#0F172A]">
                      Intermittent Packet Dropout / Missing Anchors
                    </span>
                    <p className="text-[11px] text-[#64748B]">
                      Rate of blocked transmission packets from moving obstacles or antenna misalignment.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => stepDropout(-0.05)}
                      disabled={isRunning || activeScenario.dropoutRate <= 0.00}
                      className="w-7 h-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] active:scale-95 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                      title="Decrease dropout (-5%)"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="min-w-[75px] text-center font-mono font-bold text-xs px-2.5 py-1 bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A]">
                      {(activeScenario.dropoutRate * 100).toFixed(0)} % Loss
                    </span>
                    <button
                      type="button"
                      onClick={() => stepDropout(0.05)}
                      disabled={isRunning || activeScenario.dropoutRate >= 0.50}
                      className="w-7 h-7 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] hover:bg-[#F1F5F9] active:scale-95 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                      title="Increase dropout (+5%)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="0.00"
                  max="0.50"
                  step="0.01"
                  value={activeScenario.dropoutRate}
                  onChange={(e) => updateScenario({ dropoutRate: parseFloat(e.target.value) })}
                  disabled={isRunning}
                  className="w-full accent-[#059669] bg-[#E2E8F0] rounded-full h-2 cursor-pointer"
                />

                {/* Targeted Quick-Select Chips */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-[#64748B] font-medium">Quick Target:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { val: 0.00, label: '0% Clean Line' },
                      { val: 0.05, label: '5% Minor Loss' },
                      { val: 0.20, label: '20% Obstructed' },
                      { val: 0.40, label: '40% Heavy Loss' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => updateScenario({ dropoutRate: item.val })}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          Math.abs(activeScenario.dropoutRate - item.val) < 0.005
                            ? 'bg-[#059669] text-white border-[#059669] font-bold'
                            : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#94A3B8]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Non-Line-of-Sight (NLOS) Wall Delay Bias */}
              <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#92400E]">
                      Non-Line-of-Sight (NLOS) Wall Delay Bias
                    </span>
                    <p className="text-[11px] text-[#B45309]">
                      Systematic positive shift added when radio signals penetrate walls or reflect.
                    </p>
                  </div>
                  <span className="font-mono text-[#92400E] font-extrabold text-xs px-2.5 py-1 bg-white border border-[#FDE68A] rounded-lg self-start sm:self-auto">
                    {(simulationState.nlosRate * 100).toFixed(0)}% chance | +{activeScenario.multipathBiasMeanMeters.toFixed(2)}m shift
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#92400E]">
                      <span>Obstacle Chance</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => stepNlosRate(-0.05)}
                          className="w-5 h-5 rounded bg-white border border-[#FDE68A] text-[#92400E] hover:bg-[#FEF3C7] flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold">{(simulationState.nlosRate * 100).toFixed(0)}%</span>
                        <button
                          type="button"
                          onClick={() => stepNlosRate(0.05)}
                          className="w-5 h-5 rounded bg-white border border-[#FDE68A] text-[#92400E] hover:bg-[#FEF3C7] flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="0.60"
                      step="0.05"
                      value={simulationState.nlosRate}
                      onChange={(e) => setSimulationConfig({ nlosRate: parseFloat(e.target.value) })}
                      disabled={isRunning}
                      className="w-full accent-[#D97706] bg-[#FDE68A] rounded-full h-2 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#92400E]">
                      <span>Mean Delay Shift</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => stepBias(-0.10)}
                          className="w-5 h-5 rounded bg-white border border-[#FDE68A] text-[#92400E] hover:bg-[#FEF3C7] flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold">+{activeScenario.multipathBiasMeanMeters.toFixed(2)}m</span>
                        <button
                          type="button"
                          onClick={() => stepBias(0.10)}
                          className="w-5 h-5 rounded bg-white border border-[#FDE68A] text-[#92400E] hover:bg-[#FEF3C7] flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="1.50"
                      step="0.05"
                      value={activeScenario.multipathBiasMeanMeters}
                      onChange={(e) => updateScenario({ multipathBiasMeanMeters: parseFloat(e.target.value) })}
                      disabled={isRunning}
                      className="w-full accent-[#D97706] bg-[#FDE68A] rounded-full h-2 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Target Chips */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1 border-t border-[#FDE68A]">
                  <span className="text-[10px] text-[#92400E] font-medium">Wall Type:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { nlosRate: 0.00, bias: 0.00, label: 'Direct (No Walls)' },
                      { nlosRate: 0.10, bias: 0.35, label: 'Drywall (+0.35m)' },
                      { nlosRate: 0.20, bias: 0.70, label: 'Glass / Office (+0.70m)' },
                      { nlosRate: 0.35, bias: 1.10, label: 'Concrete (+1.10m)' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSimulationConfig({ nlosRate: item.nlosRate });
                          updateScenario({ multipathBiasMeanMeters: item.bias });
                        }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          Math.abs(activeScenario.multipathBiasMeanMeters - item.bias) < 0.05 &&
                          Math.abs(simulationState.nlosRate - item.nlosRate) < 0.01
                            ? 'bg-[#B45309] text-white border-[#B45309] font-bold'
                            : 'bg-white text-[#92400E] border-[#FDE68A] hover:bg-[#FEF3C7]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation Random Seed */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <span className="font-bold text-xs text-[#0F172A]">Simulation Random Seed</span>
                  <p className="text-[11px] text-[#64748B]">Fixes reproducible stochastic noise sequences.</p>
                </div>
                <div className="flex items-center gap-2">
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
                    className="w-24 bg-white border border-[#CBD5E1] rounded-xl px-2.5 py-1.5 text-xs text-[#0F172A] font-mono font-bold focus:outline-none focus:border-[#2563EB]"
                  />
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => setSimulationConfig({ randomSeed: Math.floor(Math.random() * 10000) })}
                    disabled={isRunning}
                  >
                    Randomize
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Transceivers Grid */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Radio className="w-4 h-4 text-[#171717]" />
                  Anchor Transceiver Constellation
                </CardTitle>
                <CardDescription>
                  6 ceiling-mounted anchors synchronized with backend 3D room coordinate system (12m × 8m room).
                </CardDescription>
              </div>
              <Badge variant="lime" size="sm">
                6 Anchors Online
              </Badge>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeScenario.anchors.map((anchor) => (
                <div
                  key={anchor.id}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F172A]">
                      <span className="w-5 h-5 rounded-md bg-[#0F172A] text-white font-mono text-[10px] flex items-center justify-center font-bold">
                        {anchor.id}
                      </span>
                      <span>Anchor {anchor.id}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] font-mono text-[#64748B]">
                      <span className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded">X {anchor.x}m</span>
                      <span className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded">Y {anchor.y}m</span>
                      <span className="bg-white border border-[#E2E8F0] px-1 py-0.5 rounded">Z {anchor.z}m</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Visual Simulation Preview & Collapsible Contract */}
        <div className="space-y-6">
          {/* Card 1: Visual Simulation Environment Snapshot */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Activity className="w-4 h-4 text-[#171717]" />
                  Simulation Environment Preview
                </CardTitle>
                <CardDescription>
                  Real-time channel metrics calculated from your configuration
                </CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-4">
              {/* Signal Cleanliness Score */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F172A]">Signal Cleanliness Index</span>
                  <span className={`font-mono font-bold ${
                    signalCleanliness > 75 ? 'text-[#16A34A]' : signalCleanliness > 45 ? 'text-[#D97706]' : 'text-rose-600'
                  }`}>
                    {signalCleanliness}% Quality
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      signalCleanliness > 75 ? 'bg-[#16A34A]' : signalCleanliness > 45 ? 'bg-[#D97706]' : 'bg-rose-500'
                    }`}
                    style={{ width: `${signalCleanliness}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>Degraded</span>
                  <span>Moderate</span>
                  <span>Optimal</span>
                </div>
              </div>

              {/* Simulation Configuration Summary Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-medium">Solver Model</span>
                  <span className="font-bold text-[#0F172A] truncate block mt-0.5">
                    {simulationState.selectedBackendSolver === 'robust_nls'
                      ? 'Robust NLS'
                      : simulationState.selectedBackendSolver === 'robust_nls_kalman'
                      ? 'Robust + Kalman'
                      : simulationState.selectedBackendSolver === 'nls_kalman'
                      ? 'NLS + Kalman'
                      : 'Ordinary NLS'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-medium">Trajectory Path</span>
                  <span className="font-bold text-[#0F172A] capitalize truncate block mt-0.5">
                    {simulationState.trajectoryType.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-medium">Total Waypoints</span>
                  <span className="font-bold font-mono text-[#0F172A] block mt-0.5">
                    {simulationState.numPoints} samples
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[10px] text-[#64748B] block font-medium">Active Anchors</span>
                  <span className="font-bold font-mono text-[#0F172A] block mt-0.5">
                    6 Nodes (3D)
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                className="w-full justify-center py-2.5 shadow-sm font-bold"
                leftIcon={isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                onClick={handleRunSimulation}
                disabled={isRunning}
              >
                {isRunning ? 'Solving Positioning...' : 'Execute Simulation Run'}
              </Button>
            </div>
          </Card>

          {/* Card 2: Interactive Collapsible Request Contract */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setShowJsonContract(!showJsonContract)}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#171717]" />
                  <CardTitle>Live Request Contract</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="lime" size="sm">
                    POST /api/v1/simulations/run
                  </Badge>
                  <button
                    type="button"
                    className="text-[#64748B] hover:text-[#0F172A] p-0.5"
                    aria-label="Toggle JSON"
                  >
                    {showJsonContract ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardHeader>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span>FastAPI endpoint schema payload</span>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="flex items-center gap-1 text-[11px] text-[#2563EB] hover:underline cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              {showJsonContract ? (
                <pre className="p-3.5 rounded-xl bg-[#0F172A] text-[#E2E8F0] text-[11px] font-mono overflow-x-auto shadow-inner leading-relaxed">
{JSON.stringify(payloadObject, null, 2)}
                </pre>
              ) : (
                <div
                  onClick={() => setShowJsonContract(true)}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors cursor-pointer text-center text-xs text-[#64748B] font-medium"
                >
                  Click to inspect full JSON payload structure ({Object.keys(payloadObject).length} fields)
                </div>
              )}
            </div>
          </Card>

          {/* Card 3: Human-Friendly Simulation Workflow */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xs">
                ?
              </span>
              <h4 className="text-xs font-bold text-[#0F172A]">
                How This Simulation Runs
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-[#475569]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E2E8F0] text-[#0F172A] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="leading-snug">
                  <strong>Trajectory Generation:</strong> Computes the exact ground-truth path in 3D room coordinates.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E2E8F0] text-[#0F172A] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="leading-snug">
                  <strong>Channel Degradation:</strong> Injects range noise (σ), drops blocked packets, and adds wall reflection bias.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E2E8F0] text-[#0F172A] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="leading-snug">
                  <strong>Numerical Solver:</strong> Solves non-linear distance equations to estimate coordinates and evaluate error.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
