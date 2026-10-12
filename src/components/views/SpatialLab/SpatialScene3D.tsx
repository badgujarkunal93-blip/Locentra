import React, { useRef, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../../store/useAppStore';

interface SpatialScene3DProps {
  className?: string;
}

// Subcomponent: The 3D Room, Floor, Grid, and Perimeter Boundaries
const RoomEnvironment: React.FC<{ width: number; length: number; height: number }> = ({
  width,
  length,
  height,
}) => {
  return (
    <group>
      {/* Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#081014" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Room Perimeter Wireframe Box */}
      <lineSegments position={[0, height / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, length)]} />
        <lineBasicMaterial color="#10b981" transparent opacity={0.3} />
      </lineSegments>

      {/* Translucent Corner Wall Pillars */}
      {[
        [-width / 2, -length / 2],
        [width / 2, -length / 2],
        [-width / 2, length / 2],
        [width / 2, length / 2],
      ].map(([x, z], idx) => (
        <mesh key={`pillar-${idx}`} position={[x, height / 2, z]}>
          <boxGeometry args={[0.15, height, 0.15]} />
          <meshStandardMaterial color="#104033" roughness={0.5} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Metre Grid Lines on Floor */}
      <gridHelper
        args={[Math.max(width, length), Math.max(width, length), '#10b981', '#103328']}
        position={[0, 0, 0]}
      />
    </group>
  );
};

// Subcomponent: 3D Anchor Beacons
const AnchorBeacons: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const selectedAnchorId = useAppStore((s) => s.selectedAnchorId);
  const setSelectedAnchorId = useAppStore((s) => s.setSelectedAnchorId);
  const showAnchorLabels = useAppStore((s) => s.showAnchorLabels);

  const room = activeScenario.room;

  return (
    <group>
      {activeScenario.anchors.map((anchor) => {
        // Map room coords (0..width, 0..length) to 3D origin-centered coords
        const x3d = anchor.x - room.width / 2;
        const z3d = anchor.y - room.length / 2;
        const y3d = anchor.z || 2.8;

        const isSelected = anchor.id === selectedAnchorId;
        const isActive = anchor.isActive;

        return (
          <group
            key={`3d-anchor-${anchor.id}`}
            position={[x3d, y3d, z3d]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAnchorId(anchor.id);
            }}
          >
            {/* Ceiling drop mount wire */}
            <line>
              <bufferGeometry
                attach="geometry"
                {...new THREE.BufferGeometry().setFromPoints([
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(0, room.height - y3d, 0),
                ])}
              />
              <lineBasicMaterial color="#334155" />
            </line>

            {/* Anchor Transceiver Body */}
            <mesh>
              <cylinderGeometry args={[0.2, 0.25, 0.35, 16]} />
              <meshStandardMaterial
                color={isActive ? (isSelected ? '#34d399' : '#10b981') : '#475569'}
                emissive={isActive ? '#059669' : '#000000'}
                emissiveIntensity={isSelected ? 0.9 : 0.4}
                roughness={0.3}
              />
            </mesh>

            {/* Glowing Beacon Sphere */}
            <mesh position={[0, -0.22, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial
                color={isActive ? '#34d399' : '#64748b'}
                emissive={isActive ? '#10b981' : '#000000'}
                emissiveIntensity={isActive ? 1.0 : 0}
              />
            </mesh>

            {/* Selection Pulsing Ring */}
            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.35, 0.42, 32]} />
                <meshBasicMaterial color="#34d399" side={THREE.DoubleSide} transparent opacity={0.8} />
              </mesh>
            )}

            {/* 3D Anchor Label Billboard */}
            {showAnchorLabels && (
              <Billboard position={[0, 0.45, 0]} follow={true} lockX={false} lockY={false} lockZ={false}>
                <Text
                  fontSize={0.28}
                  color={isSelected ? '#34d399' : isActive ? '#6ee7b7' : '#94a3b8'}
                  anchorX="center"
                  anchorY="middle"
                >
                  {anchor.id}
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Subcomponent: Trajectory Paths and Current Target
const TargetAndTrajectories: React.FC = () => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const trajectory = useAppStore((s) => s.trajectory);
  const playbackIndex = useAppStore((s) => s.playbackIndex);
  const showGroundTruth = useAppStore((s) => s.showGroundTruth);
  const showEstimated = useAppStore((s) => s.showEstimated);
  const showRangeRays = useAppStore((s) => s.showRangeRays);

  const room = activeScenario.room;
  const currentPoint = trajectory[playbackIndex] || trajectory[0];

  // Ground Truth 3D Vector Path
  const gtPoints = useMemo(() => {
    return trajectory.map(
      (p) => new THREE.Vector3(p.x - room.width / 2, p.z || 0.8, p.y - room.length / 2)
    );
  }, [trajectory, room]);

  // Estimated 3D Vector Path
  const estPoints = useMemo(() => {
    return trajectory.map(
      (p) => new THREE.Vector3(p.estimatedX - room.width / 2, p.estimatedZ || 0.8, p.estimatedY - room.length / 2)
    );
  }, [trajectory, room]);

  const targetGtPos = new THREE.Vector3(
    currentPoint.x - room.width / 2,
    currentPoint.z || 0.8,
    currentPoint.y - room.length / 2
  );

  const targetEstPos = new THREE.Vector3(
    currentPoint.estimatedX - room.width / 2,
    currentPoint.estimatedZ || 0.8,
    currentPoint.estimatedY - room.length / 2
  );

  return (
    <group>
      {/* Ground Truth Path Line in 3D */}
      {showGroundTruth && gtPoints.length > 1 && (
        <line>
          <bufferGeometry
            attach="geometry"
            {...new THREE.BufferGeometry().setFromPoints(gtPoints)}
          />
          <lineBasicMaterial color="#06b6d4" transparent opacity={0.8} />
        </line>
      )}

      {/* Estimated Path Line in 3D */}
      {showEstimated && estPoints.length > 1 && (
        <line>
          <bufferGeometry
            attach="geometry"
            {...new THREE.BufferGeometry().setFromPoints(estPoints)}
          />
          <lineBasicMaterial color="#10b981" transparent opacity={0.6} />
        </line>
      )}

      {/* Ground Truth Target Mesh */}
      {showGroundTruth && (
        <group position={targetGtPos}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#06b6d4"
              emissiveIntensity={0.8}
              roughness={0.2}
            />
          </mesh>
          {/* Target shadow drop onto floor */}
          <mesh position={[0, -targetGtPos.y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.2, 16]} />
            <meshBasicMaterial color="#083344" transparent opacity={0.6} />
          </mesh>
          <Billboard position={[0, 0.45, 0]}>
            <Text fontSize={0.22} color="#22d3ee" anchorX="center" anchorY="middle">
              Target (GT)
            </Text>
          </Billboard>
        </group>
      )}

      {/* Estimated Target Mesh (Mint for valid, Amber for degraded/failed) */}
      {showEstimated && (
        <group position={targetEstPos}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.2]} />
            <meshStandardMaterial
              color={currentPoint.isDegraded ? "#f59e0b" : "#34d399"}
              emissive={currentPoint.isDegraded ? "#d97706" : "#10b981"}
              emissiveIntensity={0.7}
              roughness={0.3}
            />
          </mesh>
          {currentPoint.isDegraded && (
            <Billboard position={[0, 0.35, 0]}>
              <Text fontSize={0.18} color="#fbbf24" anchorX="center" anchorY="middle">
                Degraded
              </Text>
            </Billboard>
          )}
        </group>
      )}

      {/* Error Displacement Line in 3D */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints([targetGtPos, targetEstPos])}
        />
        <lineBasicMaterial color="#f43f5e" transparent opacity={0.8} />
      </line>

      {/* 3D Range Rays to Active Anchors */}
      {showRangeRays &&
        activeScenario.anchors
          .filter((a) => a.isActive)
          .map((anchor) => {
            const anchorPos = new THREE.Vector3(
              anchor.x - room.width / 2,
              anchor.z || 2.8,
              anchor.y - room.length / 2
            );
            return (
              <line key={`3d-ray-${anchor.id}`}>
                <bufferGeometry
                  attach="geometry"
                  {...new THREE.BufferGeometry().setFromPoints([anchorPos, targetGtPos])}
                />
                <lineBasicMaterial color="#f59e0b" transparent opacity={0.45} />
              </line>
            );
          })}
    </group>
  );
};

export const SpatialScene3D: React.FC<SpatialScene3DProps> = ({ className }) => {
  const activeScenario = useAppStore((s) => s.activeScenario);
  const controlsRef = useRef<any>(null);
  const [cameraView, setCameraView] = useState<'angle' | 'top'>('angle');

  const setAngleView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(0, 11, 13);
      controlsRef.current.target.set(0, 1, 0);
      controlsRef.current.update();
      setCameraView('angle');
    }
  };

  const setTopDownView = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, 18, 0.001);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      setCameraView('top');
    }
  };

  return (
    <div className={`relative w-full h-full bg-[#050a0d] rounded-xl overflow-hidden border border-emerald-950/60 ${className || ''}`} style={{ minHeight: '440px' }}>
      {/* 3D Camera Preset Overlay Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 rounded-lg bg-slate-950/80 border border-slate-800 backdrop-blur-md">
        <button
          onClick={setAngleView}
          className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
            cameraView === 'angle' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="3D Perspective Angle View"
        >
          Perspective
        </button>
        <button
          onClick={setTopDownView}
          className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
            cameraView === 'top' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Top-Down Orthographic-Style View"
        >
          Top-Down
        </button>
      </div>

      {/* Hint overlay */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none text-[10px] font-mono text-slate-400 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/80">
        Left Click: Orbit • Right Click: Pan • Scroll: Zoom
      </div>

      <Canvas
        camera={{ position: [0, 11, 13], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Atmosphere Lighting */}
        <ambientLight intensity={0.65} color="#c8e6c9" />
        <directionalLight position={[10, 15, 10]} intensity={1.1} color="#e0f2fe" />
        <directionalLight position={[-10, 10, -10]} intensity={0.4} color="#a7f3d0" />

        {/* Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={4}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.05}
        />

        {/* Room Boundaries & Floor */}
        <RoomEnvironment
          width={activeScenario.room.width}
          length={activeScenario.room.length}
          height={activeScenario.room.height}
        />

        {/* Anchors */}
        <AnchorBeacons />

        {/* Target and Paths */}
        <TargetAndTrajectories />
      </Canvas>
    </div>
  );
};
