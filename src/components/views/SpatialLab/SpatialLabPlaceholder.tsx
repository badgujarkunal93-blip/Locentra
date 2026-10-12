import React, { useState } from 'react';
import { 
  Box, 
  MapPin, 
  CheckCircle2, 
  Cpu,
  Radio,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { SectionHeader } from '../../ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardDescription } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Tabs } from '../../ui/Tabs';

export const SpatialLabPlaceholder: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  const [viewMode, setViewMode] = useState<'split' | '2d' | '3d'>('split');
  const [selectedAnchorId, setSelectedAnchorId] = useState<string>('A1');

  const selectedAnchor = activeScenario.anchors.find((a) => a.id === selectedAnchorId) || activeScenario.anchors[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SectionHeader
        categoryTag="Spatial Environment"
        phaseBadge="Phase 2 Target"
        title="Spatial Lab & Dual-Viewport Visualiser"
        subtitle="Shared-state 2D floor plan (SVG/D3) and 3D room simulation (Three.js / React Three Fiber / Drei) displaying transceivers, ground-truth paths, and solver estimates."
        actions={
          <div className="flex items-center gap-2.5">
            <Tabs
              size="sm"
              options={[
                { id: 'split', label: 'Split View' },
                { id: '2d', label: '2D Floor Plan' },
                { id: '3d', label: '3D Room Mesh' },
              ]}
              activeId={viewMode}
              onChange={setViewMode}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveSection('scenario-studio')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Configure Studio
            </Button>
          </div>
        }
      />

      {/* Main Viewport Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Dual 2D/3D Wireframe Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden border border-emerald-900/30">
            {/* Canvas Header Bar */}
            <div className="px-5 py-3.5 border-b border-emerald-950/60 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span className="text-xs font-semibold text-slate-200">
                  {viewMode === 'split' ? 'Synchronized 2D/3D Dual Projection' : viewMode === '2d' ? '2D Top-Down Projection (SVG/D3)' : '3D Volumetric Mesh (R3F/Three.js)'}
                </span>
                <span className="text-slate-500 font-mono text-xs">•</span>
                <span className="text-xs font-mono text-emerald-400/80">
                  {activeScenario.room.width}m × {activeScenario.room.length}m × {activeScenario.room.height}m
                </span>
              </div>
              <Badge variant="cyan" size="sm">
                Phase 2 Architecture Ready
              </Badge>
            </div>

            {/* Technical Simulation Blueprint Canvas */}
            <div className="h-[420px] bg-[#050b0d] relative flex items-center justify-center p-6 overflow-hidden bg-tech-grid-dense">
              {/* Radar Grid Circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-96 h-96 rounded-full border border-emerald-500/40" />
                <div className="w-64 h-64 rounded-full border border-emerald-500/30 absolute" />
                <div className="w-32 h-32 rounded-full border border-emerald-500/20 absolute" />
                <div className="w-full h-px bg-emerald-500/20 absolute" />
                <div className="h-full w-px bg-emerald-500/20 absolute" />
              </div>

              {/* Anchors Nodes Visualization Wireframe */}
              <div className="relative w-full h-full max-w-md max-h-72 border border-emerald-500/30 rounded-xl bg-slate-950/50 p-4 shadow-2xl flex flex-col justify-between">
                {/* Simulated Room Boundary */}
                <div className="text-[10px] font-mono text-emerald-400/70 flex justify-between">
                  <span>(0.0, 0.0) [NW Origin]</span>
                  <span>({activeScenario.room.width.toFixed(1)}, 0.0) [NE]</span>
                </div>

                {/* Interactive Anchor Positions */}
                <div className="absolute inset-6">
                  {activeScenario.anchors.map((a) => {
                    const leftPct = (a.x / activeScenario.room.width) * 100;
                    const topPct = (a.y / activeScenario.room.length) * 100;
                    const isSelected = a.id === selectedAnchorId;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAnchorId(a.id)}
                        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-lg border transition-all cursor-pointer group ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_#10b981] scale-110'
                            : 'bg-slate-900/90 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
                        }`}
                        title={`${a.name}: (${a.x}m, ${a.y}m, ${a.z}m)`}
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono whitespace-nowrap opacity-75 group-hover:opacity-100">
                          {a.id}
                        </span>
                      </button>
                    );
                  })}

                  {/* Target Representative Trajectory Wireframe */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    </div>
                    <span className="text-[9px] font-mono text-cyan-300 mt-1 whitespace-nowrap bg-slate-900/80 px-1 rounded">
                      Target Estimated (6.2, 3.8)
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-emerald-400/70 flex justify-between">
                  <span>(0.0, {activeScenario.room.length.toFixed(1)}) [SW]</span>
                  <span>({activeScenario.room.width.toFixed(1)}, {activeScenario.room.length.toFixed(1)}) [SE]</span>
                </div>
              </div>

              {/* Phase 2 Overlay Callout */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl p-3 bg-slate-950/90 border border-emerald-800/60 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Box className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-300">
                    Phase 2 will integrate interactive 3D camera controls, raycasting range arcs, and path playback.
                  </span>
                </div>
                <Badge variant="mint" size="sm">
                  R3F & Three.js Ready
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Selected Anchor Telemetry & Architecture Specifications */}
        <div className="space-y-4">
          <Card className="border border-emerald-900/30">
            <CardHeader>
              <div>
                <CardTitle>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Transceiver Properties
                </CardTitle>
                <CardDescription>
                  Selected anchor spatial coordinates & RF degradation channel
                </CardDescription>
              </div>
              <Badge variant={selectedAnchor.status === 'healthy' ? 'mint' : 'amber'} size="sm">
                {selectedAnchor.status.toUpperCase()}
              </Badge>
            </CardHeader>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Node Identifier:</span>
                  <span className="font-mono font-semibold text-slate-100">{selectedAnchor.id} ({selectedAnchor.name})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinate (X, Y, Z):</span>
                  <span className="font-mono text-emerald-300 font-semibold">
                    {selectedAnchor.x.toFixed(2)}m, {selectedAnchor.y.toFixed(2)}m, {selectedAnchor.z?.toFixed(2)}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NLOS Probability:</span>
                  <span className="font-mono text-amber-300">{(selectedAnchor.nlosProb * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/70 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zustand synchronized state pipeline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>D3 scaleLinear & SVG coordinate mapper ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OrbitControls & WebGL canvas ready</span>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="forest" className="border-emerald-800/40">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-200">
                Phase 2 Implementation Scope
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Phase 2 delivers high-performance 2D SVG canvas rendering, Three.js 3D viewport with camera orbit controls, and real-time range arcs connecting anchors to target points.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
