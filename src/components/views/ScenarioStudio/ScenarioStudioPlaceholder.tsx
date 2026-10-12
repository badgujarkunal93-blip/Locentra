import React from 'react';
import { 
  SlidersHorizontal, 
  Radio, 
  Cpu, 
  Save, 
  RotateCcw,
  Info
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { SectionHeader } from '../../ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export const ScenarioStudioPlaceholder: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const updateScenario = useAppStore((s) => s.updateScenario);

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
      dropoutRate: 0.04,
      multipathBiasMeanMeters: 0.35,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SectionHeader
        categoryTag="Simulation Controls"
        phaseBadge="Phase 3 Target"
        title="Scenario Studio & Degradation Studio"
        subtitle="Configure physical measurement noise, intermittent anchor dropouts, multipath non-line-of-sight (NLOS) positive bias, and room occlusions."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Reset Defaults
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={() => alert('Scenario configuration stored in client state. Python simulator integration begins in Phase 3.')}
            >
              Apply Profile
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Interactive Degradation Sliders */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <div>
                <CardTitle>
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  Stochastic Channel Parameters
                </CardTitle>
                <CardDescription>
                  Configure synthetic range measurement corruption matrices
                </CardDescription>
              </div>
              <Badge variant="mint" size="sm">
                Active Config
              </Badge>
            </CardHeader>

            <div className="space-y-6">
              {/* Noise Std Dev */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    Gaussian Range Noise (Additive White Gaussian Noise)
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
                  max="0.40"
                  step="0.01"
                  value={activeScenario.dropoutRate}
                  onChange={handleDropoutChange}
                  className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>0% (Full Packet Stream)</span>
                  <span>20% (Sporadic Dropout)</span>
                  <span>40% (Degraded Topology)</span>
                </div>
              </div>

              {/* NLOS Positive Bias */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">
                    Non-Line-of-Sight (NLOS) Exponential Positive Bias
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    μ = +{activeScenario.multipathBiasMeanMeters.toFixed(2)} m
                  </span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="1.50"
                  step="0.05"
                  value={activeScenario.multipathBiasMeanMeters}
                  onChange={handleBiasChange}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>+0.00 m (Direct LOS)</span>
                  <span>+0.50 m (Partition Wall)</span>
                  <span>+1.50 m (Metallic Obstacle)</span>
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
                  Enable or isolate individual anchor nodes to test geometric dilution of precision (GDOP).
                </CardDescription>
              </div>
              <Badge variant="cyan" size="sm">
                6 Nodes Deployed
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
                    <p className="text-[10px] text-slate-400 truncate">{anchor.name}</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Schema Preview & Architecture Roadmap */}
        <div className="space-y-4">
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <CardTitle>
                <Cpu className="w-4 h-4 text-emerald-400" />
                Scenario Schema Payload
              </CardTitle>
              <Badge variant="mint" size="sm">
                JSON Contract
              </Badge>
            </CardHeader>

            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-emerald-400/90 overflow-x-auto">
{JSON.stringify({
  scenario_id: activeScenario.id,
  dimensions: activeScenario.room,
  noise_sigma: activeScenario.noiseStdDevMeters,
  dropout_prob: activeScenario.dropoutRate,
  nlos_bias_mu: activeScenario.multipathBiasMeanMeters,
  anchors_count: activeScenario.anchors.length,
}, null, 2)}
            </pre>
            <p className="text-[11px] text-slate-400 mt-2">
              This contract feeds the Python NumPy trajectory simulator in Phase 3.
            </p>
          </Card>

          <Card variant="forest" className="border-emerald-800/40">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-200">
                Phase 3 Simulator Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In Phase 3, the Python backend will ingest these exact parameters to generate stochastic range observations with ground-truth preservation and strict anti-leakage guarantees.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
