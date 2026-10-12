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
      <div className="rounded-[24px] p-5 bg-white border border-[#EAEAEA] shadow-[0_2px_14px_-2px_rgba(0,0,0,0.04)] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DDD6F8] flex items-center justify-center text-[#4C3B9E] shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <span className="text-[#555555]">
            <strong className="text-[#171717] font-bold">Dataset Vault:</strong> Synthetic trajectory generator outputs NumPy/Pandas Parquet files with strict isolation between training and unseen test splits.
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
          <div className="flex items-center gap-2.5 flex-wrap">
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
              onClick={() => alert('Parquet export schema ready for solver evaluation.')}
            >
              Export Schema
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Trajectories Catalog Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <Database className="w-4 h-4 text-[#171717]" />
                  Synthetic Trajectory Corpus
                </CardTitle>
                <CardDescription>
                  Reproducible kinematically constrained paths with ground-truth positions.
                </CardDescription>
              </div>
              <Badge variant="lime" size="sm">
                4 Sets Cataloged
              </Badge>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#EAEAEA] text-[#777777] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3 font-bold">Dataset ID</th>
                    <th className="py-3 px-3 font-bold">Path Description</th>
                    <th className="py-3 px-3 text-right font-bold">Waypoints</th>
                    <th className="py-3 px-3 text-right font-bold">Length</th>
                    <th className="py-3 px-3 text-right font-bold">Channel Noise</th>
                    <th className="py-3 px-3 text-right font-bold">Split</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA]">
                  {illustrativeTrajectories.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9F9F9] transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#171717]">{item.id}</td>
                      <td className="py-3.5 px-3 font-sans font-semibold text-[#171717]">{item.name}</td>
                      <td className="py-3.5 px-3 text-right text-[#555555]">{item.points}</td>
                      <td className="py-3.5 px-3 text-right text-[#555555]">{item.lengthMeters} m</td>
                      <td className="py-3.5 px-3 text-right font-bold text-amber-700">{item.noiseLevel}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2F2F2] text-[#555555]">
                          {item.split}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3.5 border-t border-[#F0F0F0] flex items-center justify-between text-xs text-[#777777]">
              <span>All trajectories are generated using constant-velocity / constant-acceleration motion models.</span>
              <span className="font-mono text-[#171717] font-bold">Seed: 42 (Deterministic)</span>
            </div>
          </Card>
        </div>

        {/* Right Column: Data Leakage Protection & Rules */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <ShieldCheck className="w-4 h-4 text-[#171717]" />
                Anti-Leakage Architecture Rules
              </CardTitle>
            </CardHeader>
            <div className="space-y-3.5 text-xs text-[#555555]">
              <div className="p-4 rounded-[18px] bg-[#F9F9F9] border border-[#EAEAEA] space-y-2">
                <div className="flex items-center gap-2 text-[#171717] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Blind Inference Guarantee
                </div>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Positioning models and ML calibration layers never receive true (x, y) coordinates at test time.
                </p>
              </div>

              <div className="p-4 rounded-[18px] bg-[#F9F9F9] border border-[#EAEAEA] space-y-2">
                <div className="flex items-center gap-2 text-[#171717] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Separate Unseen Trajectories
                </div>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Evaluation benchmark only runs on unseen trajectories with different motion dynamics than training paths.
                </p>
              </div>
            </div>
          </Card>

          <div className="bg-[#F5F2FE] border border-[#DDD6F8] rounded-[24px] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Table className="w-4 h-4 text-[#B6A9EF]" />
              <span className="text-xs font-bold text-[#4C3B9E]">
                Data Quality Checks
              </span>
            </div>
            <p className="text-xs text-[#555555] leading-relaxed">
              Automated data validation pipeline runs integrity checks for NaN range dropouts, negative distance anomalies, and kinematic infeasibility prior to solver consumption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
