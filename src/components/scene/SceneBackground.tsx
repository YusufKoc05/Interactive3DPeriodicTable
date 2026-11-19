import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export const SceneBackground: React.FC = () => {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = -14 + Math.sin(state.clock.elapsedTime * 0.4) * 0.4;
    }
  });

  return (
    <>
      {/* Deep Obsidian Abyss Background */}
      <color attach="background" args={['#020409']} />
      <fog attach="fog" args={['#020409', 40, 115]} />

      {/* Cinematic Studio Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[15, 25, 20]} intensity={1.4} color="#f8fafc" />
      <directionalLight position={[-15, -20, -15]} intensity={0.6} color="#38bdf8" />
      <pointLight position={[0, 0, 15]} intensity={0.8} color="#818cf8" />

      {/* Atmospheric Star Field */}
      <Stars
        radius={80}
        depth={60}
        count={3500}
        factor={3.8}
        saturation={0.3}
        fade
        speed={0.6}
      />

      {/* Floating Ambient Quantum Energy Dust */}
      <Sparkles
        count={150}
        scale={[60, 40, 30]}
        size={2.5}
        speed={0.4}
        opacity={0.35}
        color="#38bdf8"
      />

      {/* Subtle Futuristic Floor Grid */}
      <group ref={gridRef} position={[0, -14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <gridHelper args={[120, 60, '#1e293b', '#090d16']} />
      </group>
    </>
  );
};
