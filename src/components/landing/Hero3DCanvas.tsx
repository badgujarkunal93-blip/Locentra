import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw, 
  Crosshair
} from 'lucide-react';

export type EngineMode = 'ols' | 'locentra';

interface AnchorNode {
  id: string;
  name: string;
  x: number;
  y: number; // height in 3D
  z: number;
  color: string;
}

const ROOM_DIMS = { width: 14, length: 10, height: 4 };

const ANCHORS: AnchorNode[] = [
  { id: 'A1', name: 'Anchor #1 (NW)', x: -6.0, y: 3.2, z: -4.0, color: '#10B981' },
  { id: 'A2', name: 'Anchor #2 (NE)', x: 6.0, y: 3.2, z: -4.0, color: '#10B981' },
  { id: 'A3', name: 'Anchor #3 (SE)', x: 6.0, y: 3.2, z: 4.0, color: '#10B981' },
  { id: 'A4', name: 'Anchor #4 (SW)', x: -6.0, y: 3.2, z: 4.0, color: '#10B981' },
];

// Ground truth loop trajectory waypoints (smooth figure-8 / racetrack loop)
const WAYPOINTS: [number, number][] = [
  [-4.0, -2.5],
  [-2.0, -3.0],
  [1.0, -2.8],
  [3.8, -2.0],
  [4.5, -0.5],
  [3.5, 1.5],
  [1.5, 2.5],
  [-1.0, 2.8],
  [-3.5, 2.2],
  [-4.5, 0.5],
];

// Subcomponent: Isometric Architectural Warehouse Room (Light Theme)
const WarehouseEnvironment: React.FC<{ 
  mode: EngineMode; 
  onFloorPointerMove: (point: THREE.Vector3 | null) => void;
  hoverPoint: THREE.Vector3 | null;
}> = ({ mode, onFloorPointerMove, hoverPoint }) => {
  const floorRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Light Clean Architectural Floor */}
      <mesh
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onPointerMove={(e) => {
          e.stopPropagation();
          onFloorPointerMove(e.point);
        }}
        onPointerOut={() => onFloorPointerMove(null)}
      >
        <planeGeometry args={[ROOM_DIMS.width, ROOM_DIMS.length]} />
        <meshStandardMaterial 
          color="#F1F3F5" 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>

      {/* Primary Clean Grid on Floor */}
      <gridHelper
        args={[14, 14, '#94A3B8', '#E2E8F0']}
        position={[0, 0.005, 0]}
      />

      {/* Sub-grid with higher density */}
      <gridHelper
        args={[14, 28, '#CBD5E1', '#F1F5F9']}
        position={[0, 0.002, 0]}
      />

      {/* Room Perimeter Boundary Wireframe */}
      <lineSegments position={[0, ROOM_DIMS.height / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(ROOM_DIMS.width, ROOM_DIMS.height, ROOM_DIMS.length)]} />
        <lineBasicMaterial 
          color={mode === 'ols' ? '#EF4444' : '#64748B'} 
          transparent 
          opacity={0.35} 
        />
      </lineSegments>

      {/* Frosted Glass Perimeter Walls */}
      {/* Back Wall */}
      <mesh position={[0, ROOM_DIMS.height / 2, -ROOM_DIMS.length / 2]}>
        <planeGeometry args={[ROOM_DIMS.width, ROOM_DIMS.height]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.45}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-ROOM_DIMS.width / 2, ROOM_DIMS.height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_DIMS.length, ROOM_DIMS.height]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.45}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Clean Charcoal Corner Pillars */}
      {[
        [-ROOM_DIMS.width / 2, -ROOM_DIMS.length / 2],
        [ROOM_DIMS.width / 2, -ROOM_DIMS.length / 2],
        [-ROOM_DIMS.width / 2, ROOM_DIMS.length / 2],
        [ROOM_DIMS.width / 2, ROOM_DIMS.length / 2],
      ].map(([px, pz], idx) => (
        <group key={`corner-pillar-${idx}`} position={[px, ROOM_DIMS.height / 2, pz]}>
          <mesh>
            <boxGeometry args={[0.25, ROOM_DIMS.height, 0.25]} />
            <meshStandardMaterial color="#232124" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Concrete Barrier (NLOS Wall) */}
      <group position={[-1.5, 1.2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 2.4, 3.6]} />
          <meshStandardMaterial 
            color="#475569" 
            roughness={0.9} 
          />
        </mesh>
        {/* Subtle top indicator */}
        <mesh position={[0.21, 0, 0]}>
          <planeGeometry args={[0.01, 2.3]} />
          <meshBasicMaterial color="#D9F56F" />
        </mesh>
        <Billboard position={[0, 1.5, 0]}>
          <Text fontSize={0.22} color="#1E293B" anchorX="center" anchorY="middle">
            CONCRETE NLOS BARRIER
          </Text>
        </Billboard>
      </group>

      {/* Raycast Ripple Marker on cursor hover */}
      {hoverPoint && (
        <group position={[hoverPoint.x, 0.02, hoverPoint.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.15, 32]} />
            <meshBasicMaterial color="#232124" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.42, 32]} />
            <meshBasicMaterial color="#84CC16" transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.78, 32]} />
            <meshBasicMaterial color="#84CC16" transparent opacity={0.4} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Subcomponent: 4 Wall Radio Anchors with Status Rings
const RadioAnchors: React.FC<{ 
  mode: EngineMode; 
  hoverPoint: THREE.Vector3 | null;
  targetPos: THREE.Vector3;
}> = ({ mode, hoverPoint, targetPos }) => {
  return (
    <group>
      {ANCHORS.map((anchor) => {
        const anchorPos = new THREE.Vector3(anchor.x, anchor.y, anchor.z);

        return (
          <group key={anchor.id} position={anchorPos}>
            {/* Mount fixture bracket */}
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
              <meshStandardMaterial color="#64748B" />
            </mesh>

            {/* Anchor Body */}
            <mesh>
              <cylinderGeometry args={[0.22, 0.26, 0.35, 24]} />
              <meshStandardMaterial 
                color="#FFFFFF" 
                roughness={0.2} 
              />
            </mesh>

            {/* Status Beacon Light */}
            <mesh position={[0, -0.2, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial 
                color={anchor.color} 
                emissive={anchor.color} 
                emissiveIntensity={0.8} 
              />
            </mesh>

            {/* Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
              <ringGeometry args={[0.3, 0.36, 32]} />
              <meshBasicMaterial 
                color={anchor.color} 
                side={THREE.DoubleSide} 
                transparent 
                opacity={0.8} 
              />
            </mesh>

            {/* ID Billboard */}
            <Billboard position={[0, 0.55, 0]}>
              <Text 
                fontSize={0.26} 
                color="#171717" 
                anchorX="center" 
                anchorY="middle"
              >
                {anchor.id}
              </Text>
            </Billboard>

            {/* Range Ray to Target Object */}
            <line>
              <bufferGeometry
                attach="geometry"
                {...new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(0, 0, 0),
                  targetPos.clone().sub(anchorPos),
                ])}
              />
              <lineBasicMaterial 
                color={mode === 'ols' ? '#EF4444' : '#10B981'} 
                transparent 
                opacity={mode === 'ols' ? 0.35 : 0.45} 
              />
            </line>

            {/* Ray to Hover Probe */}
            {hoverPoint && (
              <line>
                <bufferGeometry
                  attach="geometry"
                  {...new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(0, 0, 0),
                    hoverPoint.clone().sub(anchorPos),
                  ])}
                />
                <lineBasicMaterial 
                  color="#F59E0B" 
                  transparent 
                  opacity={0.4} 
                />
              </line>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Subcomponent: Autonomous Asset Pod & Dual-Engine Trajectory
const RoverAndTrajectory: React.FC<{
  mode: EngineMode;
  onTelemetryUpdate: (telemetry: {
    x: number;
    y: number;
    z: number;
    dop: number;
    huberWeight: number;
    isGlitching: boolean;
    nlosSpikeMagnitude: number;
  }) => void;
  onTargetPosChange: (pos: THREE.Vector3) => void;
}> = ({ mode, onTelemetryUpdate, onTargetPosChange }) => {
  const roverGroupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const curve = useMemo(() => {
    const points = WAYPOINTS.map(([x, z]) => new THREE.Vector3(x, 0.4, z));
    return new THREE.CatmullRomCurve3(points, true, 'centripetal');
  }, []);

  const truePathPoints = useMemo(() => {
    return curve.getPoints(160);
  }, [curve]);

  useFrame((_, delta) => {
    timeRef.current += delta * 0.45;
    const progress = (timeRef.current % 10) / 10;
    
    const idealPos = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress);

    let displayPos = idealPos.clone();
    let isGlitching = false;
    let spikeMag = 0;

    if (mode === 'ols') {
      const nearBarrier = idealPos.x > -3.5 && idealPos.x < 0.5 && idealPos.z > -2.0 && idealPos.z < 2.5;
      
      if (nearBarrier) {
        isGlitching = true;
        const glitchX = (Math.sin(timeRef.current * 42) > 0.3 ? 1 : -1) * (2.8 + Math.sin(timeRef.current * 18) * 1.5);
        const glitchZ = (Math.cos(timeRef.current * 36) > 0.2 ? 1 : -1) * (2.2 + Math.cos(timeRef.current * 24) * 1.2);
        displayPos.x += glitchX;
        displayPos.z += glitchZ;
        displayPos.y = 0.4 + Math.sin(timeRef.current * 30) * 0.25;
        spikeMag = Math.sqrt(glitchX * glitchX + glitchZ * glitchZ);
      } else {
        displayPos.x += (Math.random() - 0.5) * 0.35;
        displayPos.z += (Math.random() - 0.5) * 0.35;
      }
    } else {
      // Locentra smooth Huber path
      displayPos.x += Math.sin(timeRef.current * 10) * 0.02;
      displayPos.z += Math.cos(timeRef.current * 10) * 0.02;
    }

    if (roverGroupRef.current) {
      roverGroupRef.current.position.copy(displayPos);
      if (tangent) {
        const angle = Math.atan2(tangent.x, tangent.z);
        roverGroupRef.current.rotation.y = angle;
      }
    }

    onTargetPosChange(displayPos);

    const dop = mode === 'ols' ? 4.82 + Math.random() * 2.5 : 1.12 + Math.random() * 0.04;
    const huberWeight = mode === 'ols' ? 0.12 : 0.98;
    onTelemetryUpdate({
      x: parseFloat((displayPos.x + 7.0).toFixed(2)),
      y: parseFloat((displayPos.z + 5.0).toFixed(2)),
      z: 1.05,
      dop: parseFloat(dop.toFixed(2)),
      huberWeight: parseFloat(huberWeight.toFixed(2)),
      isGlitching,
      nlosSpikeMagnitude: parseFloat(spikeMag.toFixed(2)),
    });
  });

  return (
    <group>
      {/* Trajectory Path Line */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints(truePathPoints)}
        />
        <lineBasicMaterial 
          color={mode === 'ols' ? '#EF4444' : '#10B981'} 
          linewidth={2} 
          transparent 
          opacity={mode === 'ols' ? 0.4 : 0.9} 
        />
      </line>

      {/* Target Asset Pod */}
      <group ref={roverGroupRef} position={[0, 0.4, 0]}>
        {/* Pod Body */}
        <mesh castShadow>
          <boxGeometry args={[0.65, 0.22, 0.95]} />
          <meshStandardMaterial 
            color="#232124" 
            metalness={0.3} 
            roughness={0.4} 
          />
        </mesh>

        {/* Lime Accent Trim */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.55, 0.04, 0.85]} />
          <meshBasicMaterial 
            color={mode === 'ols' ? '#EF4444' : '#D9F56F'} 
          />
        </mesh>

        {/* Top Dome */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.14, 16]} />
          <meshStandardMaterial 
            color="#334155" 
            emissive={mode === 'ols' ? '#EF4444' : '#10B981'} 
            emissiveIntensity={0.6} 
          />
        </mesh>

        {/* 4 Wheels */}
        {[
          [-0.36, -0.06, 0.3],
          [0.36, -0.06, 0.3],
          [-0.36, -0.06, -0.3],
          [0.36, -0.06, -0.3],
        ].map(([wx, wy, wz], widx) => (
          <mesh key={`wheel-${widx}`} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
            <meshStandardMaterial color="#0F172A" roughness={0.8} />
          </mesh>
        ))}

        {/* Shadow onto floor */}
        <mesh position={[0, -0.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.45, 16]} />
          <meshBasicMaterial color="#CBD5E1" transparent opacity={0.6} />
        </mesh>

        {/* Label */}
        <Billboard position={[0, 0.65, 0]}>
          <Text 
            fontSize={0.2} 
            color={mode === 'ols' ? '#DC2626' : '#171717'} 
            anchorX="center" 
            anchorY="middle"
          >
            {mode === 'ols' ? '⚠️ OLS ROVER (UNSTABLE)' : '● LOCENTRA ASSET POD'}
          </Text>
        </Billboard>
      </group>
    </group>
  );
};

export const Hero3DCanvas: React.FC = () => {
  const [engineMode, setEngineMode] = useState<EngineMode>('locentra');
  const [hoverPoint, setHoverPoint] = useState<THREE.Vector3 | null>(null);
  const [targetPos, setTargetPos] = useState<THREE.Vector3>(new THREE.Vector3(0, 0.4, 0));
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'top'>('iso');
  const controlsRef = useRef<any>(null);

  const [telemetry, setTelemetry] = useState({
    x: 12.42,
    y: 8.19,
    z: 1.05,
    dop: 1.12,
    huberWeight: 0.98,
    isGlitching: false,
    nlosSpikeMagnitude: 0,
  });

  const hoverDistances = useMemo(() => {
    if (!hoverPoint) return null;
    return ANCHORS.map((a) => {
      const aPos = new THREE.Vector3(a.x, a.y, a.z);
      const dist = hoverPoint.distanceTo(aPos);
      return { id: a.id, dist: parseFloat(dist.toFixed(2)) };
    });
  }, [hoverPoint]);

  const handleIsoView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(11, 10, 11);
      controlsRef.current.target.set(0, 0.5, 0);
      controlsRef.current.update();
      setCameraPreset('iso');
    }
  };

  const handleTopView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0.001, 16, 0.001);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      setCameraPreset('top');
    }
  };

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[580px] rounded-2xl overflow-hidden border border-[#EAEAEA] bg-[#F8F9FA] shadow-md">
      
      {/* TOP OVERLAY: Clean Segmented Engine Toggle */}
      <div className="absolute top-4 left-4 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex items-center p-1 rounded-xl bg-white/95 border border-[#EAEAEA] backdrop-blur-md shadow-sm">
          <button
            onClick={() => setEngineMode('ols')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              engineMode === 'ols'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Standard OLS</span>
          </button>

          <button
            onClick={() => setEngineMode('locentra')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              engineMode === 'locentra'
                ? 'bg-[#D9F56F] text-[#171717] font-extrabold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#171717]" />
            <span>Locentra Engine</span>
          </button>
        </div>
      </div>

      {/* TOP RIGHT: Camera Preset Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 rounded-xl bg-white/95 border border-[#EAEAEA] backdrop-blur-md shadow-xs">
        <button
          onClick={handleIsoView}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
            cameraPreset === 'iso' ? 'bg-[#232124] text-white font-bold' : 'text-slate-600 hover:text-black'
          }`}
          title="Isometric View"
        >
          Isometric
        </button>
        <button
          onClick={handleTopView}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
            cameraPreset === 'top' ? 'bg-[#232124] text-white font-bold' : 'text-slate-600 hover:text-black'
          }`}
          title="Top-Down View"
        >
          Top-Down
        </button>
        <button
          onClick={handleIsoView}
          className="p-1 rounded text-slate-500 hover:text-black transition-colors"
          title="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* WARNING POPUP: Shown in OLS Mode */}
      {engineMode === 'ols' && (
        <div className="absolute top-16 left-4 z-20 max-w-sm p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-mono font-bold text-rose-700 uppercase">
                Multipath NLOS Spike Detected
              </div>
              <p className="text-[11px] text-rose-800 mt-1">
                Concrete barrier caused a +4.6m bounce. Quadratic OLS squares the residual and jumps through solid masonry.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM LEFT: Conceptual Telemetry Card */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-white/95 border border-[#EAEAEA] backdrop-blur-md shadow-lg max-w-xs sm:max-w-md">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${engineMode === 'locentra' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="font-bold text-[#171717]">Conceptual Demonstration HUD</span>
          </div>
          <span className="text-slate-400 text-[10px]">14m × 10m Testbed</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-[#F8F9FA] p-1.5 rounded-lg border border-[#EAEAEA]">
            <span className="text-[9px] text-[#71717A] block uppercase">Coords</span>
            <span className="font-bold text-[#171717] text-[11px]">
              {telemetry.x}m, {telemetry.y}m
            </span>
          </div>

          <div className="bg-[#F8F9FA] p-1.5 rounded-lg border border-[#EAEAEA]">
            <span className="text-[9px] text-[#71717A] block uppercase">DOP</span>
            <span className={`font-bold text-[11px] ${telemetry.dop > 3.0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {telemetry.dop}
            </span>
          </div>

          <div className="bg-[#F8F9FA] p-1.5 rounded-lg border border-[#EAEAEA]">
            <span className="text-[9px] text-[#71717A] block uppercase">Huber Weight</span>
            <span className={`font-bold text-[11px] ${engineMode === 'locentra' ? 'text-emerald-700' : 'text-rose-600'}`}>
              {telemetry.huberWeight}
            </span>
          </div>

          <div className="bg-[#F8F9FA] p-1.5 rounded-lg border border-[#EAEAEA]" title="Benchmark solver computation time on reference hardware">
            <span className="text-[9px] text-[#71717A] block uppercase">Solver Time</span>
            <span className="font-bold text-[#171717] text-[11px]">
              ~1.4ms ref
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT: Hover Distance Probe Tooltip */}
      {hoverDistances && (
        <div className="absolute bottom-4 right-4 z-20 p-2.5 rounded-xl bg-white/95 border border-[#EAEAEA] backdrop-blur-md shadow-md text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#171717] text-[11px] font-bold pb-1 mb-1 border-b border-slate-100">
            <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            <span>Range Probe</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2.5 text-[10px] text-[#52525B]">
            {hoverDistances.map((d) => (
              <span key={d.id}>
                {d.id}: <strong className="text-[#171717]">{d.dist}m</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3D Canvas Viewport */}
      <Canvas
        camera={{ position: [11, 10, 11], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.8} color="#FFFFFF" />
        <directionalLight position={[10, 15, 10]} intensity={1.1} color="#FFFFFF" />
        <directionalLight position={[-10, 12, -10]} intensity={0.4} color="#F1F5F9" />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={6}
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.05}
        />

        <WarehouseEnvironment 
          mode={engineMode} 
          onFloorPointerMove={setHoverPoint}
          hoverPoint={hoverPoint}
        />

        <RadioAnchors 
          mode={engineMode} 
          hoverPoint={hoverPoint}
          targetPos={targetPos}
        />

        <RoverAndTrajectory 
          mode={engineMode} 
          onTelemetryUpdate={setTelemetry}
          onTargetPosChange={setTargetPos}
        />
      </Canvas>
    </div>
  );
};
