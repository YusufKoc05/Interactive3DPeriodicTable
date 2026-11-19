import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ChemicalElement } from '../../types/element';
import isotopesDataRaw from '../../data/isotopes.json';
import type { Isotope } from '../../types/advancedFeatures';
import { sound } from '../../audio/soundEngine';

const allIsotopes = isotopesDataRaw as Record<string, Isotope[]>;

interface DecaySimulator3DProps {
  element: ChemicalElement;
  animationSpeed?: number;
}

export const DecaySimulator3D: React.FC<DecaySimulator3DProps> = ({ element, animationSpeed = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Mesh>(null);

  const isotopes = useMemo(() => {
    return (
      allIsotopes[element.symbol] || [
        {
          massNumber: Math.round(element.atomicMass),
          protons: element.atomicNumber,
          neutrons: Math.round(element.atomicMass) - element.atomicNumber,
          abundancePercent: 100,
          halfLifeText: 'Kararlı (Stable)',
          decayMode: 'stable' as const,
          descriptionTr: 'Kararlı izotop; radyoaktif bozunma göstermez.',
          descriptionEn: 'Stable isotope; does not undergo spontaneous decay.'
        }
      ]
    );
  }, [element]);

  // Prefer first radioactive isotope if available
  const activeIsotope = useMemo(() => {
    return isotopes.find((iso) => iso.decayMode !== 'stable') || isotopes[0];
  }, [isotopes]);

  const [particlePos, setParticlePos] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [isDecaying, setIsDecaying] = useState(false);
  const [decayTimer, setDecayTimer] = useState(0);

  const triggerDecay = () => {
    if (activeIsotope.decayMode === 'stable') return;
    setIsDecaying(true);
    setDecayTimer(0);
    setParticlePos(new THREE.Vector3(0, 0, 0));

    const mode = activeIsotope.decayMode === 'alpha' ? 'alpha' : activeIsotope.decayMode === 'beta_minus' ? 'beta' : 'gamma';
    sound.playDecay(mode);
  };

  useEffect(() => {
    // Auto trigger decay upon opening simulator
    const timeout = setTimeout(() => {
      triggerDecay();
    }, 600);
    return () => clearTimeout(timeout);
  }, [activeIsotope]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25 * animationSpeed;
    }

    if (isDecaying) {
      setDecayTimer((prev) => {
        const next = prev + delta * 3 * animationSpeed;
        if (next > 4) {
          setIsDecaying(false);
          return 0;
        }
        return next;
      });

      // Eject particle along +X direction
      setParticlePos(new THREE.Vector3(decayTimer * 2.2, Math.sin(decayTimer * 4) * 0.3, 0));

      if (waveRef.current) {
        const s = 1 + decayTimer * 1.8;
        waveRef.current.scale.set(s, s, s);
        (waveRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - decayTimer / 3);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} onClick={triggerDecay}>
      {/* Central Parent Nucleus */}
      <Sphere args={[0.95, 32, 32]}>
        <meshPhysicalMaterial
          color={isDecaying ? '#f59e0b' : '#ef4444'}
          emissive={isDecaying ? '#d97706' : '#991b1b'}
          emissiveIntensity={isDecaying ? 0.8 : 0.3}
          metalness={0.4}
          roughness={0.2}
          wireframe={false}
        />
      </Sphere>

      {/* Nucleon Cloud Pulsing Halo */}
      <Sphere args={[1.2, 16, 16]}>
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={isDecaying ? 0.35 : 0.12}
          wireframe
        />
      </Sphere>

      {/* Emitted Particle (Alpha / Beta / Gamma) */}
      {isDecaying && (
        <>
          {/* Gamma shockwave ring */}
          <mesh ref={waveRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 0.95, 32]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>

          {/* Ejected Particle Cluster */}
          <group position={particlePos}>
            {activeIsotope.decayMode === 'alpha' ? (
              // Alpha particle: 2 protons (red) + 2 neutrons (cyan)
              <group scale={0.25}>
                <Sphere position={[-0.3, -0.3, 0]} args={[0.3, 16, 16]}>
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
                </Sphere>
                <Sphere position={[0.3, -0.3, 0]} args={[0.3, 16, 16]}>
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
                </Sphere>
                <Sphere position={[-0.3, 0.3, 0]} args={[0.3, 16, 16]}>
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
                </Sphere>
                <Sphere position={[0.3, 0.3, 0]} args={[0.3, 16, 16]}>
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
                </Sphere>
              </group>
            ) : (
              // Beta electron / positron (high energy neon spark)
              <Sphere args={[0.16, 16, 16]}>
                <meshBasicMaterial color="#00f0ff" />
              </Sphere>
            )}
          </group>
        </>
      )}

      {/* Floating Info Tag */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.28}
        color="#e2e8f0"
        anchorX="center"
        anchorY="top"
        fontWeight="bold"
      >
        {`${element.symbol}-${activeIsotope.massNumber} (${activeIsotope.halfLifeText})`}
      </Text>

      {/* Daughter Product Label when decaying */}
      {isDecaying && activeIsotope.daughterProduct && (
        <Text
          position={[particlePos.x, particlePos.y + 0.5, particlePos.z]}
          fontSize={0.22}
          color="#38bdf8"
          anchorX="center"
          anchorY="bottom"
        >
          {`+ ${activeIsotope.daughterProduct}`}
        </Text>
      )}
    </group>
  );
};
