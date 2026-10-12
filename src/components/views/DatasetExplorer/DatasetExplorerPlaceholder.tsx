import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Table,
  Info
} from 'lucide-react';
import { SectionHeader } from '../../ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';

export const DatasetExplorerPlaceholder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trajectories' | 'observations' | 'splits'>('trajectories');

  const illustrativeTrajectories = [
    { id: 'TRAJ-001', name: 'Figure-Eight Smooth Sweep', points: 650, lengthMeters: 48.2, noiseLevel: 'Low (0.08m)', split: 'Train (70%)' },
    { id: 'TRAJ-002', name: 'Corridor Perimeter Patrol', points: 420, lengthMeters: 36.0, noiseLevel: 'Moderate (0.15m)', split: 'Train (70%)' },
    { id: 'TRAJ-003', name: 'Random Walk with Obstacles', points: 800, lengthMeters: 55.4, noiseLevel: 'High + NLOS', split: 'Val (15%)' },
    { id: 'TRAJ-004', name: 'High-Acceleration Sharp Turns', points: 510, lengthMeters: 41.8, noiseLevel: 'High + Dropouts', split: 'Test Unseen (15%)' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Illustrative Notice */}
      <div className="rounded-xl p-3.5 bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            <strong className="text-emerald-300">Dataset Vault Prototype:</strong> Synthetic trajectory generator will output NumPy/Pandas Parquet files in Phase 3 & 4 with strict isolation between training and unseen test splits.
          </span>
        </div>
        <Badge variant="illustrative" size="sm">Mock Data</Badge>
      </div>

      <SectionHeader
        categoryTag="Data Repository"
        phaseBadge="Phase 4 Target"
        title="Dataset Explorer & Trajectory Vault"
        subtitle="Manage reproducible synthetic ground truth motion paths, raw range measurements, data quality audits, and train/test evaluation splits."
        actions={
          <div className="flex items-center gap-2.5">
            <Tabs
              size="sm"
              options={[
                { id: 'trajectories', label: 'Trajectory Sets' },
                { id: 'observations', label: 'Raw Observations' },
                { id: 'splits', label: 'Evaluation Splits' },
              ]}
              activeId={activeTab}
              onChange={setActiveTab}
            />
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => alert('Parquet export pipeline connects in Phase 4.')}
            >
              Export Schema
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Trajectories Catalog Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <div>
                <CardTitle>
                  <Database className="w-4 h-4 text-emerald-400" />
                  Synthetic Trajectory Corpus
                </CardTitle>
                <CardDescription>
                  Reproducible kinematically constrained paths with ground-truth positions.
                </CardDescription>
              </div>
              <Badge variant="mint" size="sm">
                4 Sets Cataloged
              </Badge>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-emerald-950/80 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Dataset ID</th>
                    <th className="py-2.5 px-3">Path Description</th>
                    <th className="py-2.5 px-3 text-right">Waypoints</th>
                    <th className="py-2.5 px-3 text-right">Length</th>
                    <th className="py-2.5 px-3 text-right">Channel Noise</th>
                    <th className="py-2.5 px-3 text-right">Split</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {illustrativeTrajectories.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-emerald-400">{item.id}</td>
                      <td className="py-3 px-3 font-sans text-slate-200">{item.name}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{item.points}</td>
                      <td className="py-3 px-3 text-right text-slate-300">{item.lengthMeters} m</td>
                      <td className="py-3 px-3 text-right text-amber-300/90">{item.noiseLevel}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {item.split}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
              <span>All trajectories are generated using constant-velocity / constant-acceleration motion models.</span>
              <span className="font-mono text-emerald-400">Seed: 42 (Deterministic)</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Data Leakage Protection & Rules */}
        <div className="space-y-4">
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <CardTitle>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Anti-Leakage Architecture Rules
              </CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Blind Inference Guarantee
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Positioning models and ML calibration layers never receive true (x, y) coordinates at test time.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Separate Unseen Trajectories
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Evaluation benchmark only runs on unseen trajectories with different motion dynamics than training paths.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="forest" className="border-emerald-800/40">
            <div className="flex items-center gap-2 mb-2">
              <Table className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-200">
                Data Quality Checks
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Phase 4 pipeline will run automated tests checking for NaN range dropouts, negative distance anomalies, and kinematic infeasibility prior to solver consumption.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
