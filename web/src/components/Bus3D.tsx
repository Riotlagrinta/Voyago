'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export function BusModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={[1, 1, 1]}>
      {/* Corps du bus (Robin Egg Blue - Soft) */}
      <RoundedBox args={[4, 1.8, 2]} radius={0.1} smoothness={4} position={[0, 1, 0]}>
        <meshStandardMaterial color="#50C9CE" />
      </RoundedBox>

      {/* Pare-brise */}
      <mesh position={[2, 1.2, 0]}>
        <boxGeometry args={[0.1, 1, 1.8]} />
        <meshStandardMaterial color="#2E382E" metalness={1} roughness={0} />
      </mesh>

      {/* Vitres latÃ©rales */}
      <mesh position={[0, 1.3, 1.01]}>
        <boxGeometry args={[3, 0.6, 0.02]} />
        <meshStandardMaterial color="#2E382E" metalness={1} roughness={0} />
      </mesh>
      <mesh position={[0, 1.3, -1.01]}>
        <boxGeometry args={[3, 0.6, 0.02]} />
        <meshStandardMaterial color="#2E382E" metalness={1} roughness={0} />
      </mesh>

      {/* Roues */}
      <Wheel position={[-1.2, 0.3, 0.9]} />
      <Wheel position={[1.2, 0.3, 0.9]} />
      <Wheel position={[-1.2, 0.3, -0.9]} />
      <Wheel position={[1.2, 0.3, -0.9]} />

      {/* Phares AVANT */}
      <mesh position={[2.01, 0.8, 0.6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={2} />
      </mesh>
      <mesh position={[2.01, 0.8, -0.6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

function Wheel({ position }: { position: [number, number, number] }) {
  const wheelRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (wheelRef.current) wheelRef.current.rotation.z -= 0.1;
  });

  return (
    <mesh ref={wheelRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 0.4, 32]} />
      <meshStandardMaterial color="#2E382E" />
    </mesh>
  );
}

export default function Bus3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={40} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <BusModel />
      </Canvas>
    </div>
  );
}
