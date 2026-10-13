import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Camera, 
  ChevronRight, 
  Play, 
  Pause,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export type ZoneId = 'zone1' | 'zone2' | 'zone3';

interface ZoneConfig {
  id: ZoneId;
  title: string;
  badge: string;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
  description: string;
  diagnostic: string;
}

const ZONES: ZoneConfig[] = [
  {
    id: 'zone1',
    title: 'Zone 1: Concrete Wall Zoom (NLOS Filter)',
    badge: 'Multipath Suppression',
    cameraPos: [-3.5, 3.2, 3.2],
    targetPos: [-1.5, 1.2, 0],
    description:
      'Camera zooms into dense concrete partition. Signal rays bouncing off masonry flash laser red and clip out; true direct paths glow cyan/green.',
    diagnostic: 'Huber Residual: Outlier ray magnitude +4.8m rejected (Weight 0.08)',
  },
  {
    id: 'zone2',
    title: 'Zone 2: Anchor Power Outage (30%+ Dropouts)',
    badge: 'Kinematic Survival',
    cameraPos: [5.5, 4.5, 5.5],
    targetPos: [3.5, 1.5, 1.5],
    description:
      '2 of 4 anchors switch off with spark effects. A projected kinematic dotted trajectory keeps the target moving smoothly across blind spots.',
    diagnostic: 'EKF State: Continuous constant-velocity propagation (Zero frame drop)',
  },
  {
    id: 'zone3',
    title: 'Zone 3: Top-Down Grid View (Matrix Health)',
    badge: 'Jacobian DOP Health',
    cameraPos: [0.001, 16, 0.001],
    targetPos: [0, 0, 0],
    description:
      'Camera tilts to top-down 2D grid. Floor grid turns amber when anchors align in straight lines, displaying an Ill-Conditioned Matrix warning badge.',
    diagnostic: 'Condition Number κ: 48.2 (Warning) → Ridge Regularization Engaged',
  },
];

// 3D Scene for Scrollytelling
const ScrollytellingScene: React.FC<{ activeZone: ZoneId }> = ({ activeZone }) => {
  const currentZone = ZONES.find((z) => z.id === activeZone) || ZONES[0];
  const controlsRef = useRef<any>(null);

  // Smooth camera interpolation towards zone target
  useFrame((state, delta) => {
    if (controlsRef.current) {
      const targetVec = new THREE.Vector3(...currentZone.targetPos);
      const camVec = new THREE.Vector3(...currentZone.cameraPos);
      
      // Interpolate camera position and target smoothly
      state.camera.position.lerp(camVec, delta * 3.2);
      controlsRef.current.target.lerp(targetVec, delta * 3.2);
      controlsRef.current.update();
    }
  });

  return (
    <group>
      <OrbitControls 
        ref={controlsRef} 
        enableDamping 
        dampingFactor={0.05} 
        maxDistance={25}
        minDistance={3}
      />

      <ambientLight intensity={0.7} color="#FFFFFF" />
      <directionalLight position={[8, 14, 8]} intensity={1.4} color="#FFFFFF" />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#D9F56F" distance={15} />

      {/* Floor Grid (changes to amber in zone 3) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#F1F3F5" roughness={0.5} metalness={0.1} />
      </mesh>

      <gridHelper
        args={[14, 14, activeZone === 'zone3' ? '#F59E0B' : '#232124', activeZone === 'zone3' ? '#FEF3C7' : '#EAEAEA']}
        position={[0, 0.005, 0]}
      />

      {/* Concrete Wall Partition (Focus of Zone 1) */}
      <group position={[-1.5, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.4, 2.4, 3.6]} />
          <meshStandardMaterial 
            color="#D1D5DB" 
            roughness={0.7} 
            metalness={0.1} 
          />
        </mesh>

        {/* Hazard yellow trim */}
        <mesh position={[0.21, 0, 0]}>
          <planeGeometry args={[0.01, 2.3]} />
          <meshBasicMaterial color="#FFB800" />
        </mesh>

        <Billboard position={[0, 1.5, 0]}>
          <Text fontSize={0.22} color={activeZone === 'zone1' ? '#FF3366' : '#94A3B8'} anchorX="center" anchorY="middle">
            {activeZone === 'zone1' ? 'NLOS WALL BOUNCE ZONE' : 'CONCRETE BARRIER'}
          </Text>
        </Billboard>

        {/* Multipath Rays (Zone 1) */}
        {activeZone === 'zone1' && (
          <group>
            {/* Bad Multipath Ray reflecting off wall and flashing red */}
            <line>
              <bufferGeometry
                attach="geometry"
                {...new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(-4.5, 2.0, -3.5),
                  new THREE.Vector3(0.2, 0.5, 0),
                  new THREE.Vector3(2.5, -0.6, 1.5),
                ])}
              />
              <lineBasicMaterial color="#FF3366" linewidth={3} />
            </line>

            {/* Direct Line-Of-Sight Ray (Glowing Green) */}
            <line>
              <bufferGeometry
                attach="geometry"
                {...new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(-4.5, 2.0, -3.5),
                  new THREE.Vector3(2.5, -0.6, 1.5),
                ])}
              />
              <lineBasicMaterial color="#00FF88" linewidth={2} />
            </line>

            {/* Floating Warning Tag */}
            <Billboard position={[0.4, 0.8, 0]}>
              <Text fontSize={0.2} color="#FF3366" anchorX="center" anchorY="middle">
                ✕ MULTIPATH RAY CLIPPED (+4.8m)
              </Text>
            </Billboard>
          </group>
        )}
      </group>

      {/* 4 Wall Anchors */}
      {[
        { id: 'A1', pos: [-6.0, 3.2, -4.0], isOutage: false },
        { id: 'A2', pos: [6.0, 3.2, -4.0], isOutage: false },
        { id: 'A3', pos: [6.0, 3.2, 4.0], isOutage: activeZone === 'zone2' },
        { id: 'A4', pos: [-6.0, 3.2, 4.0], isOutage: activeZone === 'zone2' },
      ].map((anchor) => {
        return (
          <group key={anchor.id} position={anchor.pos as [number, number, number]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.25, 0.35, 16]} />
              <meshStandardMaterial 
                color={anchor.isOutage ? '#9CA3AF' : '#232124'} 
                roughness={0.3} 
              />
            </mesh>

            {/* Glowing Beacon */}
            <mesh position={[0, -0.2, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial 
                color={anchor.isOutage ? '#EF4444' : '#D9F56F'} 
                emissive={anchor.isOutage ? '#991B1B' : '#8FB020'} 
                emissiveIntensity={anchor.isOutage ? 0.4 : 0.8} 
              />
            </mesh>

            <Billboard position={[0, 0.5, 0]}>
              <Text 
                fontSize={0.24} 
                color={anchor.isOutage ? '#EF4444' : '#232124'} 
                anchorX="center" 
                anchorY="middle"
              >
                {anchor.isOutage ? `${anchor.id} [OFFLINE]` : anchor.id}
              </Text>
            </Billboard>

            {/* Spark effect in Zone 2 on disabled anchors */}
            {anchor.isOutage && (
              <mesh position={[0, -0.25, 0]}>
                <octahedronGeometry args={[0.18]} />
                <meshBasicMaterial color="#FFB800" wireframe />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Kinematic Tracked Target Pod */}
      <group position={[1.5, 0.35, 1.2]}>
        <mesh>
          <boxGeometry args={[0.6, 0.2, 0.8]} />
          <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.7]} />
          <meshBasicMaterial color={activeZone === 'zone3' ? '#F59E0B' : '#D9F56F'} />
        </mesh>
        <Billboard position={[0, 0.55, 0]}>
          <Text fontSize={0.2} color="#232124" anchorX="center" anchorY="middle">
            ● ASSET POD
          </Text>
        </Billboard>
      </group>

      {/* Dotted kinematic path during outage in Zone 2 */}
      {activeZone === 'zone2' && (
        <group>
          <line>
            <bufferGeometry
              attach="geometry"
              {...new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-1.0, 0.35, 1.2),
                new THREE.Vector3(1.5, 0.35, 1.2),
                new THREE.Vector3(4.0, 0.35, 1.2),
              ])}
            />
            <lineBasicMaterial color="#00F0FF" linewidth={2} />
          </line>
          <Billboard position={[2.8, 0.8, 1.2]}>
            <Text fontSize={0.18} color="#00FF88" anchorX="center" anchorY="middle">
              KINEMATIC EXTRAPOLATION (30% ANCHOR LOSS)
            </Text>
          </Billboard>
        </group>
      )}

      {/* Singularity collinear warning badge in Zone 3 */}
      {activeZone === 'zone3' && (
        <Billboard position={[0, 2.5, 0]}>
          <Text fontSize={0.35} color="#FFB800" anchorX="center" anchorY="middle">
            [ILL-CONDITIONED MATRIX: SINGULARITY RISK]
          </Text>
        </Billboard>
      )}
    </group>
  );
};

export const ScrollytellingSection: React.FC = () => {
  const [activeZone, setActiveZone] = useState<ZoneId>('zone1');
  const [isPlayingAutoTour, setIsPlayingAutoTour] = useState(false);

  // Auto tour timer through zones
  useEffect(() => {
    if (!isPlayingAutoTour) return;
    const interval = setInterval(() => {
      setActiveZone((prev) => {
        if (prev === 'zone1') return 'zone2';
        if (prev === 'zone2') return 'zone3';
        return 'zone1';
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlayingAutoTour]);

  const currentZoneConfig = ZONES.find((z) => z.id === activeZone) || ZONES[0];

  return (
    <section id="scrollytelling" className="py-20 lg:py-28 bg-[#F8F9FA] relative overflow-hidden border-t border-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FDE8] border border-[#D9F56F] text-xs font-mono text-[#232124] font-bold mb-4">
            <Camera className="w-3.5 h-3.5" />
            <span>3D INTERACTIVE ZONE INSPECTOR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171717] tracking-tight leading-[1.15]">
            Explore 3 Critical Failure Modes in{' '}
            <span className="underline decoration-[#D9F56F] underline-offset-4 decoration-4">
              High-Fidelity 3D
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#52525B] leading-relaxed">
            Witness how the Locentra positioning engine dynamically compensates for wall reflections, severe anchor power loss, and collinear singularity risks.
          </p>
        </div>

        {/* Zone Selector Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {ZONES.map((zone, idx) => (
            <button
              key={zone.id}
              onClick={() => {
                setActiveZone(zone.id);
                setIsPlayingAutoTour(false);
              }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeZone === zone.id
                  ? 'bg-[#D9F56F] text-[#171717] border border-[#D9F56F] scale-105 shadow-sm'
                  : 'bg-white text-[#52525B] border border-[#EAEAEA] hover:border-[#D9F56F] hover:text-[#171717]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                activeZone === zone.id ? 'bg-[#232124] text-[#D9F56F]' : 'bg-[#F4F5F7] text-[#52525B]'
              }`}>
                {idx + 1}
              </span>
              <span>{zone.badge}</span>
            </button>
          ))}

          {/* Auto-Tour Toggle Button */}
          <button
            onClick={() => setIsPlayingAutoTour(!isPlayingAutoTour)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-mono text-xs font-bold border transition-colors cursor-pointer ${
              isPlayingAutoTour
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-[#EAEAEA] text-[#52525B] hover:text-[#171717] hover:border-slate-300'
            }`}
          >
            {isPlayingAutoTour ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlayingAutoTour ? 'Pause Camera Tour' : 'Auto-Tour 3D Zones'}</span>
          </button>
        </div>

        {/* Showcase Canvas & Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Side: 3D Viewport */}
          <div className="lg:col-span-8 h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-[#EAEAEA] bg-[#F1F3F5] relative shadow-sm">
            <Canvas
              camera={{ position: [-3.5, 3.2, 3.2], fov: 45 }}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            >
              <ScrollytellingScene activeZone={activeZone} />
            </Canvas>
            
            {/* Overlay Zone Badge */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-white/90 border border-[#EAEAEA] backdrop-blur-md text-xs font-mono text-[#171717] flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#D9F56F] animate-ping" />
              <span className="font-bold">{currentZoneConfig.title}</span>
            </div>

            <div className="absolute bottom-4 right-4 z-10 text-[10px] font-mono text-[#71717A] bg-white/80 px-2.5 py-1 rounded border border-[#EAEAEA]">
              Interactive View • Drag to orbit camera freely
            </div>
          </div>

          {/* Right Side: Deep-Dive Diagnostic Card */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-bold">
                  Camera Transition Focus
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#171717] mt-1">
                  {currentZoneConfig.title}
                </h3>
              </div>

              <p className="text-sm text-[#52525B] leading-relaxed">
                {currentZoneConfig.description}
              </p>

              {/* Diagnostic Box */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#232124] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Engine Diagnostic Readout
                </div>
                <p className="text-xs font-mono text-[#3F3F46]">
                  {currentZoneConfig.diagnostic}
                </p>
              </div>

              {/* Status Checklist */}
              <div className="space-y-2 text-xs font-mono text-[#52525B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sub-millimeter Coordinate Fix</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automatic Fallback Kinematics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Wall-Penetration Guarantee</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#EAEAEA]">
              <button
                onClick={() => {
                  const nextZone: ZoneId = activeZone === 'zone1' ? 'zone2' : activeZone === 'zone2' ? 'zone3' : 'zone1';
                  setActiveZone(nextZone);
                }}
                className="w-full py-3 rounded-xl bg-[#F8F9FA] hover:bg-[#F4F5F7] text-[#171717] font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#EAEAEA] hover:border-[#D9F56F]"
              >
                <span>Cycle to Next Showcase Zone</span>
                <ChevronRight className="w-4 h-4 text-[#232124]" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
