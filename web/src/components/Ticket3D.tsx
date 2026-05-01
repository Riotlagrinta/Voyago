'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Float, Text, RoundedBox, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface Ticket3DProps {
  passengerName: string;
  seatNumber: string;
  from: string;
  to: string;
  date: string;
}

function HoloStrip({ position }: { position: [number, number, number] }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const shader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color('#0EA5E9') },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        float stripe = sin(vUv.x * 20.0 + time * 2.0) * 0.5 + 0.5;
        float rainbow = sin(vUv.y * 8.0 - time * 1.5) * 0.5 + 0.5;
        vec3 holo = mix(color, vec3(rainbow, stripe * 0.5, 1.0 - rainbow), 0.45);
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 1.8);
        gl_FragColor = vec4(holo + fresnel * 0.4, 0.92);
      }`,
    transparent: true,
  }), []);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.time.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={position}>
      <boxGeometry args={[0.28, 1.85, 0.015]} />
      <shaderMaterial ref={matRef} {...shader} />
    </mesh>
  );
}

function QRCodeMesh({ position }: { position: [number, number, number] }) {
  const cells = useMemo(() => {
    const grid: { x: number; y: number }[] = [];
    const pattern = [
      [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,0,1,0,0,1,1,1,0,1],
      [1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1],
      [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
      [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0],
      [0,1,0,0,1,0,0,0,1,0,0,1,0,1,1,0,1],
      [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,1,1],
      [0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0],
      [1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,1,1,0,1,0,0,1],
      [1,0,1,1,1,0,1,0,1,0,0,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,1,0],
      [1,1,1,1,1,1,1,0,1,0,0,1,1,0,1,1,1],
    ];
    const size = pattern.length;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (pattern[row][col] === 1) {
          grid.push({
            x: (col - size / 2) * 0.048,
            y: (size / 2 - row) * 0.048,
          });
        }
      }
    }
    return grid;
  }, []);

  return (
    <group position={position}>
      {/* Fond blanc */}
      <mesh>
        <boxGeometry args={[0.88, 0.88, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Cellules noires */}
      {cells.map((cell, i) => (
        <mesh key={i} position={[cell.x, cell.y, 0.011]}>
          <boxGeometry args={[0.042, 0.042, 0.005]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}
    </group>
  );
}

function TicketModel({ passengerName, seatNumber, from, to, date }: Ticket3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.4}>
      <group ref={groupRef} rotation={[0.05, -0.15, 0]}>
        {/* Corps principal du ticket */}
        <RoundedBox args={[4.4, 2.2, 0.09]} radius={0.12} smoothness={6} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" metalness={0.05} roughness={0.45} />
        </RoundedBox>

        {/* Bande holographique gauche */}
        <HoloStrip position={[-2.0, 0, 0.052]} />

        {/* En-tête coloré */}
        <mesh position={[0.2, 0.72, 0.052]}>
          <boxGeometry args={[3.96, 0.56, 0.01]} />
          <meshStandardMaterial color="#0EA5E9" metalness={0.1} roughness={0.3} />
        </mesh>

        {/* Titre VOYAGO TICKET */}
        <Text
          position={[-0.5, 0.72, 0.065]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
        >
          VOYAGO — BILLET OFFICIEL
        </Text>

        {/* Siège — grand chiffre */}
        <Text
          position={[-1.82, 0.18, 0.065]}
          fontSize={0.55}
          color="#0EA5E9"
          anchorX="left"
          anchorY="middle"
        >
          {seatNumber}
        </Text>
        <Text
          position={[-1.82, -0.08, 0.065]}
          fontSize={0.1}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
        >
          SIÈGE
        </Text>

        {/* Route */}
        <Text
          position={[-0.8, 0.18, 0.065]}
          fontSize={0.19}
          color="#0f172a"
          anchorX="left"
          anchorY="middle"
        >
          {from}
        </Text>
        <Text
          position={[-0.8, -0.08, 0.065]}
          fontSize={0.12}
          color="#64748b"
          anchorX="left"
          anchorY="middle"
        >
          {`→  ${to}`}
        </Text>

        {/* Passager + date */}
        <Text
          position={[-1.82, -0.52, 0.065]}
          fontSize={0.11}
          color="#0f172a"
          anchorX="left"
          anchorY="middle"
        >
          {passengerName.toUpperCase()}
        </Text>
        <Text
          position={[-1.82, -0.72, 0.065]}
          fontSize={0.1}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
        >
          {date}
        </Text>

        {/* Séparateur en pointillé */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} position={[0.72 + i * 0.22, 0, 0.053]}>
            <boxGeometry args={[0.1, 0.01, 0.005]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        ))}

        {/* QR Code réaliste */}
        <QRCodeMesh position={[1.5, -0.2, 0.053]} />

        {/* Encoche de détachement (notch) en bas */}
        <mesh position={[-0.5, -1.12, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.12, 16]} />
          <meshStandardMaterial color="#f1f5f9" />
        </mesh>
      </group>
    </Float>
  );
}

function Particles() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 120;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      t: i * 0.8,
      speed: 0.006 + (Math.sin(i * 9.1) * 0.5 + 0.5) * 0.006,
      x: (Math.sin(i * 3.14) * 0.5 + 0.5) * 12 - 6,
      y: (Math.cos(i * 2.71) * 0.5 + 0.5) * 8 - 4,
      z: (Math.sin(i * 1.61) * 0.5 + 0.5) * 8 - 4,
    })), []);

  useFrame((state) => {
    particles.forEach((p, i) => {
      p.t += p.speed;
      dummy.position.set(
        p.x + Math.sin(p.t) * 2,
        p.y + Math.cos(p.t * 1.2) * 2,
        p.z + Math.sin(p.t * 0.7) * 2
      );
      const s = 0.04 + Math.sin(p.t * 2) * 0.02;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#0EA5E9" emissive="#0EA5E9" emissiveIntensity={0.6} />
    </instancedMesh>
  );
}

export default function Ticket3D(props: Ticket3DProps) {
  return (
    <div className="w-full h-[420px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <pointLight position={[8, 8, 8]} intensity={2} color="#ffffff" />
        <pointLight position={[-8, -4, 4]} intensity={1} color="#0EA5E9" />
        <spotLight position={[0, 6, 4]} angle={0.3} penumbra={0.8} intensity={1.5} color="#ffffff" castShadow />

        <Stars radius={80} depth={40} count={3000} factor={3} saturation={0} fade speed={0.6} />
        <Sparkles count={40} scale={6} size={1.5} speed={0.3} color="#0EA5E9" />
        <Particles />

        <TicketModel {...props} />
      </Canvas>
    </div>
  );
}
