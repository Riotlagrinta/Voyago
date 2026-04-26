'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, RoundedBox, Stars, Sparkles, Center } from '@react-three/drei';
import * as THREE from 'three';

interface Ticket3DProps {
  passengerName: string;
  seatNumber: string;
  from: string;
  to: string;
  date: string;
}

function Confetti({ count = 100 }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const particles = useMemo(() => {
    const pseudoRandom = (seed: number) => {
      const value = Math.sin(seed * 9999.91) * 10000;
      return value - Math.floor(value);
    };

    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = pseudoRandom(i + 1) * 100;
      const factor = 20 + pseudoRandom(i + 2) * 100;
      const speed = 0.01 + pseudoRandom(i + 3) / 200;
      const xFactor = -50 + pseudoRandom(i + 4) * 100;
      const yFactor = -50 + pseudoRandom(i + 5) * 100;
      const zFactor = -50 + pseudoRandom(i + 6) * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      const { factor, speed, xFactor, yFactor, zFactor } = particle;
      let { t } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      particle.mx += (state.mouse.x * 1000 - particle.mx) * 0.01;
      particle.my += (state.mouse.y * 1000 - particle.my) * 0.01;
      const dummy = new THREE.Object3D();
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color="#50C9CE" />
    </instancedMesh>
  );
}

function TicketModel({ passengerName, seatNumber, from, to, date }: Ticket3DProps) {
  const meshRef = useRef<THREE.Group>(null);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef} rotation={[0, -0.2, 0]}>
        {/* Corps du ticket */}
        <RoundedBox args={[4, 2, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.5} />
        </RoundedBox>

        {/* Bordure Robin Egg Blue à gauche */}
        <mesh position={[-1.9, 0, 0.06]}>
          <boxGeometry args={[0.2, 1.8, 0.01]} />
          <meshStandardMaterial color="#50C9CE" />
        </mesh>

        {/* Textes sur le ticket */}
        <Center position={[-1.6, 0.6, 0.06]} top>
          <Text color="#2E382E" fontSize={0.2} font="/fonts/Geist-Bold.ttf">
            VOYAGO TICKET
          </Text>
        </Center>

        <Text position={[-1.6, 0.2, 0.06]} color="#6B7280" fontSize={0.1} anchorX="left">
          PASSAGER: {passengerName.toUpperCase()}
        </Text>
        
        <Text position={[-1.6, -0.1, 0.06]} color="#50C9CE" fontSize={0.3} font="/fonts/Geist-Bold.ttf" anchorX="left">
          SIÈGE #{seatNumber}
        </Text>

        <Text position={[-1.6, -0.5, 0.06]} color="#2E382E" fontSize={0.12} anchorX="left">
          {from} → {to}
        </Text>

        <Text position={[-1.6, -0.7, 0.06]} color="#9CA3AF" fontSize={0.1} anchorX="left">
          DATE: {date}
        </Text>

        {/* Simulation de QR Code */}
        <mesh position={[1.3, 0, 0.06]}>
          <boxGeometry args={[0.8, 0.8, 0.01]} />
          <meshStandardMaterial color="#2E382E" />
        </mesh>
      </group>
    </Float>
  );
}

export default function Ticket3D(props: Ticket3DProps) {
  return (
    <div className="w-full h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={50} scale={5} size={2} speed={0.4} color="#50C9CE" />
        
        <TicketModel {...props} />
        <Confetti count={150} />
      </Canvas>
    </div>
  );
}
