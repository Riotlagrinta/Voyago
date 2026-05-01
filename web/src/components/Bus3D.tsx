'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  RoundedBox, PerspectiveCamera, OrbitControls,
  MeshReflectorMaterial, Text, Environment,
} from '@react-three/drei';
import * as THREE from 'three';

function Wheel({ position }: { position: [number, number, number] }) {
  const wheelRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (wheelRef.current) wheelRef.current.rotation.x += 0.04;
  });
  return (
    <group ref={wheelRef} position={position}>
      {/* Pneu */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.14, 16, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Jante */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.15, 16]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Centre */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.16, 8]} />
        <meshStandardMaterial color="#555" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
}

function BusModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.04;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Carrosserie principale */}
      <RoundedBox args={[4.2, 1.9, 2.1]} radius={0.12} smoothness={6} position={[0, 1.05, 0]}>
        <meshStandardMaterial color="#0EA5E9" metalness={0.15} roughness={0.3} />
      </RoundedBox>

      {/* Bande latérale blanche */}
      <mesh position={[0, 0.72, 1.06]}>
        <boxGeometry args={[3.6, 0.22, 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.72, -1.06]}>
        <boxGeometry args={[3.6, 0.22, 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>

      {/* Pare-brise avant */}
      <mesh position={[2.12, 1.15, 0]}>
        <boxGeometry args={[0.06, 1.1, 1.7]} />
        <meshStandardMaterial color="#a8d8ea" metalness={0.9} roughness={0} transparent opacity={0.6} />
      </mesh>

      {/* Vitres latérales */}
      {[-1.0, 0, 1.0].map((x, i) => (
        <React.Fragment key={i}>
          <RoundedBox args={[0.9, 0.55, 0.02]} radius={0.06} smoothness={4} position={[x, 1.32, 1.07]}>
            <meshStandardMaterial color="#a8d8ea" metalness={0.8} roughness={0.05} transparent opacity={0.55} />
          </RoundedBox>
          <RoundedBox args={[0.9, 0.55, 0.02]} radius={0.06} smoothness={4} position={[x, 1.32, -1.07]}>
            <meshStandardMaterial color="#a8d8ea" metalness={0.8} roughness={0.05} transparent opacity={0.55} />
          </RoundedBox>
        </React.Fragment>
      ))}

      {/* Texte VOYAGO sur le côté */}
      <Text
        position={[0.2, 1.05, 1.08]}
        fontSize={0.28}
        color="#ffffff"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        VOYAGO
      </Text>
      <Text
        position={[0.2, 1.05, -1.08]}
        fontSize={0.28}
        color="#ffffff"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI, 0]}
      >
        VOYAGO
      </Text>

      {/* Phares avant */}
      <mesh position={[2.12, 0.75, 0.65]}>
        <boxGeometry args={[0.06, 0.2, 0.38]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={3} />
      </mesh>
      <mesh position={[2.12, 0.75, -0.65]}>
        <boxGeometry args={[0.06, 0.2, 0.38]} />
        <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={3} />
      </mesh>

      {/* Feux arrière */}
      <mesh position={[-2.12, 0.75, 0.65]}>
        <boxGeometry args={[0.06, 0.2, 0.38]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-2.12, 0.75, -0.65]}>
        <boxGeometry args={[0.06, 0.2, 0.38]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>

      {/* Châssis / dessous */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4.0, 0.18, 1.85]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Porte d'entrée */}
      <RoundedBox args={[0.06, 1.2, 0.7]} radius={0.03} smoothness={4} position={[1.5, 0.9, 1.07]}>
        <meshStandardMaterial color="#0284C7" roughness={0.2} />
      </RoundedBox>

      {/* Roues */}
      <Wheel position={[-1.3, 0.38, 1.0]} />
      <Wheel position={[ 1.3, 0.38, 1.0]} />
      <Wheel position={[-1.3, 0.38, -1.0]} />
      <Wheel position={[ 1.3, 0.38, -1.0]} />

      {/* Sol réfléchissant sous le bus */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[8, 6]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101018"
          metalness={0.8}
          mirror={0}
        />
      </mesh>
    </group>
  );
}

export default function Bus3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[6, 3.5, 6]} fov={38} />
        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
        />

        {/* Éclairage */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.8} castShadow />
        <pointLight position={[-4, 4, -4]} intensity={0.8} color="#0EA5E9" />
        <pointLight position={[4, 1, 4]} intensity={0.5} color="#FDE047" />
        <Environment preset="city" />

        <BusModel />
      </Canvas>
    </div>
  );
}

export { BusModel };
