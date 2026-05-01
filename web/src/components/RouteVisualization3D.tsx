'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Sparkles, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface RouteVisualization3DProps {
  from: string;
  to: string;
  durationMin?: number;
}

function CityPin({
  position, label, color, isPulse,
}: {
  position: [number, number, number];
  label: string;
  color: string;
  isPulse: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ringRef.current && isPulse) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      ringRef.current.scale.set(s, s, s);
      (ringRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.8 - Math.sin(state.clock.elapsedTime * 3) * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Tige */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tête */}
      <mesh position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {/* Anneau de pulsation */}
      <mesh ref={ringRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.32, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Label */}
      <Text
        position={[0, 1.1, 0]}
        fontSize={0.28}
        color="#ffffff"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#0f172a"
      >
        {label}
      </Text>
    </group>
  );
}

function AnimatedRoute({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const busRef = useRef<THREE.Group>(null);

  // Courbe de Bézier avec point de contrôle en arc
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().lerp(end, 0.5);
    mid.y += 1.8; // arc
    return new THREE.QuadraticBezierCurve3(start, mid, end);
  }, [from, to]);

  // Points de la route en pointillés
  const tubePoints = useMemo(() => curve.getPoints(60), [curve]);

  useFrame((state) => {
    if (!busRef.current) return;
    const t = (state.clock.elapsedTime * 0.18) % 1;
    const pos = curve.getPoint(t);
    const tangent = curve.getTangent(t);
    busRef.current.position.copy(pos);
    busRef.current.lookAt(pos.clone().add(tangent));
  });

  return (
    <group>
      {/* Ligne pointillée */}
      {tubePoints.map((pt, i) =>
        i % 3 === 0 ? (
          <mesh key={i} position={[pt.x, pt.y, pt.z]}>
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshStandardMaterial color="#0EA5E9" emissive="#0EA5E9" emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
        ) : null
      )}

      {/* Bus animé sur la route */}
      <group ref={busRef}>
        {/* Corps */}
        <mesh>
          <boxGeometry args={[0.32, 0.18, 0.2]} />
          <meshStandardMaterial color="#0EA5E9" emissive="#0284C7" emissiveIntensity={0.4} />
        </mesh>
        {/* Pare-brise */}
        <mesh position={[0.17, 0.02, 0]}>
          <boxGeometry args={[0.02, 0.12, 0.16]} />
          <meshStandardMaterial color="#a8d8ea" transparent opacity={0.7} metalness={0.8} />
        </mesh>
        {/* Phares */}
        <mesh position={[0.17, -0.03, 0.07]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={3} />
        </mesh>
        <mesh position={[0.17, -0.03, -0.07]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={3} />
        </mesh>
        {/* Traînée lumineuse */}
        <Sparkles count={8} scale={0.4} size={1} speed={0.5} color="#0EA5E9" />
      </group>
    </group>
  );
}

function Road() {
  return (
    <>
      {/* Route plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Lignes de route */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x * 1.5, 0, 0]}>
          <planeGeometry args={[0.08, 4]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
      ))}
    </>
  );
}

export default function RouteVisualization3D({ from, to, durationMin }: RouteVisualization3DProps) {
  const fromPos: [number, number, number] = [-3.5, 0, 0];
  const toPos: [number, number, number] = [3.5, 0, 0];

  const durationText = durationMin
    ? `${Math.floor(durationMin / 60)}h${durationMin % 60 > 0 ? `${durationMin % 60}min` : ''}`
    : null;

  return (
    <div className="w-full h-[280px] rounded-3xl overflow-hidden">
      <Canvas camera={{ position: [0, 3.5, 7], fov: 45 }} dpr={[1, 2]}>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 2.4}
          minPolarAngle={Math.PI / 4}
        />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <pointLight position={[-4, 3, 0]} intensity={0.8} color="#0EA5E9" />
        <Stars radius={60} depth={30} count={1500} factor={2} saturation={0} fade speed={0.4} />

        <Road />
        <AnimatedRoute from={fromPos} to={toPos} />
        <CityPin position={fromPos} label={from} color="#10B981" isPulse={false} />
        <CityPin position={toPos} label={to} color="#0EA5E9" isPulse />

        {durationText && (
          <Float speed={1.2} floatIntensity={0.2}>
            <Text
              position={[0, 2.4, 0]}
              fontSize={0.32}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.025}
              outlineColor="#0f172a"
            >
              {`⏱ ${durationText}`}
            </Text>
          </Float>
        )}
      </Canvas>
    </div>
  );
}
