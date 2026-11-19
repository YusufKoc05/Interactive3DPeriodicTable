import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ChemicalElement } from '../../types/element';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import { CATEGORY_COLORS } from '../../utils/elementCalculators';
import { CrystalLattice3D } from './CrystalLattice3D';
import { DecaySimulator3D } from './DecaySimulator3D';

interface AtomViewer3DProps {
  element: ChemicalElement;
  position?: [number, number, number];
}

export const AtomViewer3D: React.FC<AtomViewer3DProps> = ({
  element,
  position = [0, 0, 0]
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Group>(null);

  const atomViewModel = usePeriodicStore((s) => s.atomViewModel);
  const atomAnimationSpeed = usePeriodicStore((s) => s.atomAnimationSpeed);
  const isAtomSpinning = usePeriodicStore((s) => s.isAtomSpinning);
  const language = usePeriodicStore((s) => s.language);

  const z = element.atomicNumber;
  const shells = element.shells;
  const catColor = CATEGORY_COLORS[element.category];

  // Nucleus particle setup (Protons & Neutrons)
  const nucleusParticles = useMemo(() => {
    const isHeavy = z > 24;
    const count = isHeavy ? 30 : Math.min(z * 2, 48);
    const particles = [];
    const radius = Math.min(0.6 + Math.cbrt(z) * 0.18, 1.4);

    for (let i = 0; i < count; i++) {
      const isProton = i % 2 === 0;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const r = radius * (0.3 + 0.7 * Math.random());

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const zPos = r * Math.cos(phi);

      particles.push({
        pos: [x, y, zPos] as [number, number, number],
        isProton,
        size: isHeavy ? 0.22 : 0.18
      });
    }
    return particles;
  }, [z]);

  // Electrons distribution per shell
  const shellData = useMemo(() => {
    const baseRadius = 2.2;
    const radiusStep = 0.95;

    return shells.map((electronCount, shellIdx) => {
      const radius = baseRadius + shellIdx * radiusStep;
      const inclination = (shellIdx * Math.PI) / (shells.length * 2.5);
      const azimuth = (shellIdx * Math.PI) / 4;
      const speed = (1.5 - shellIdx * 0.14) * 1.8;

      return {
        shellIndex: shellIdx,
        radius,
        electronCount,
        inclination,
        azimuth,
        speed
      };
    });
  }, [shells]);

  useFrame((state, delta) => {
    if (!isAtomSpinning) return;
    const dt = delta * atomAnimationSpeed;

    if (nucleusRef.current) {
      nucleusRef.current.rotation.y += dt * 0.5;
      nucleusRef.current.rotation.x += dt * 0.3;
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.03;
      nucleusRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Central Glow Light */}
      <pointLight color={catColor} intensity={2.5} distance={14} />
      <pointLight color="#38bdf8" intensity={1.5} distance={10} />

      {/* --- MODE 1 & 2: BOHR & QUANTUM BULUT --- */}
      {atomViewModel !== 'specimen' && (
        <>
          {/* NUCLEUS */}
          <group ref={nucleusRef}>
            <Sphere args={[0.55 + Math.cbrt(z) * 0.08, 16, 16]}>
              <meshBasicMaterial
                color={catColor}
                transparent
                opacity={0.35}
                blending={THREE.AdditiveBlending}
              />
            </Sphere>

            {nucleusParticles.map((p, idx) => (
              <Sphere key={idx} position={p.pos} args={[p.size, 12, 12]}>
                <meshStandardMaterial
                  color={p.isProton ? '#ef4444' : '#0284c7'}
                  emissive={p.isProton ? '#f87171' : '#38bdf8'}
                  emissiveIntensity={0.6}
                  roughness={0.2}
                  metalness={0.1}
                />
              </Sphere>
            ))}
          </group>

          {/* BOHR MODEL ORBITALS */}
          {atomViewModel === 'bohr' && (
            <group>
              {shellData.map((shell) => (
                <BohrShell
                  key={shell.shellIndex}
                  shell={shell}
                  speedMultiplier={atomAnimationSpeed}
                  isSpinning={isAtomSpinning}
                />
              ))}
            </group>
          )}

          {/* QUANTUM CLOUD MODE */}
          {atomViewModel === 'orbital' && (
            <QuantumCloud shellsCount={shells.length} color={catColor} />
          )}
        </>
      )}

      {/* --- MODE 3: 3D REAL PHYSICAL SPECIMEN SAMPLE VIEW --- */}
      {atomViewModel === 'specimen' && (
        <PhysicalSpecimen3D
          element={element}
          isSpinning={isAtomSpinning}
          speedMultiplier={atomAnimationSpeed}
          language={language}
        />
      )}

      {/* --- MODE 4: 3D CRYSTAL LATTICE VIEW --- */}
      {atomViewModel === 'lattice' && (
        <CrystalLattice3D
          element={element}
          isSpinning={isAtomSpinning}
          animationSpeed={atomAnimationSpeed}
        />
      )}

      {/* --- MODE 5: 3D RADIOACTIVE DECAY SIMULATION --- */}
      {atomViewModel === 'decay' && (
        <DecaySimulator3D
          element={element}
          animationSpeed={atomAnimationSpeed}
        />
      )}
    </group>
  );
};

// Sub-component for individual Bohr orbital ring and orbiting electrons
interface BohrShellProps {
  shell: {
    shellIndex: number;
    radius: number;
    electronCount: number;
    inclination: number;
    azimuth: number;
    speed: number;
  };
  speedMultiplier: number;
  isSpinning: boolean;
}

const BohrShell: React.FC<BohrShellProps> = ({ shell, speedMultiplier, isSpinning }) => {
  const electronsGroupRef = useRef<THREE.Group>(null);

  const electronAngles = useMemo(() => {
    return Array.from({ length: shell.electronCount }, (_, i) => {
      return (i * 2 * Math.PI) / shell.electronCount;
    });
  }, [shell.electronCount]);

  useFrame((_, delta) => {
    if (!isSpinning || !electronsGroupRef.current) return;
    electronsGroupRef.current.rotation.z += delta * shell.speed * speedMultiplier;
  });

  return (
    <group rotation={[shell.inclination, shell.azimuth, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[shell.radius, 0.02, 8, 80]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={electronsGroupRef}>
        {electronAngles.map((angle, idx) => {
          const x = shell.radius * Math.cos(angle);
          const y = shell.radius * Math.sin(angle);

          return (
            <group key={idx} position={[x, y, 0]}>
              <Sphere args={[0.13, 12, 12]}>
                <meshStandardMaterial
                  color="#67e8f9"
                  emissive="#06b6d4"
                  emissiveIntensity={1.2}
                  roughness={0.1}
                />
              </Sphere>
              <Sphere args={[0.22, 8, 8]}>
                <meshBasicMaterial
                  color="#22d3ee"
                  transparent
                  opacity={0.3}
                  blending={THREE.AdditiveBlending}
                />
              </Sphere>
            </group>
          );
        })}
      </group>
    </group>
  );
};

// Sub-component for Quantum Probability Cloud
const QuantumCloud: React.FC<{ shellsCount: number; color: string }> = ({
  shellsCount,
  color
}) => {
  const cloudRef = useRef<THREE.Group>(null);
  const cloudRadius = 2.5 + shellsCount * 0.9;

  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.2;
      cloudRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <group ref={cloudRef}>
      {[0.5, 0.75, 1.0].map((scale, i) => (
        <Sphere key={i} args={[cloudRadius * scale, 32, 32]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            roughness={0.8}
            metalness={0.1}
            transparent
            opacity={0.12 / (i + 1)}
            wireframe={i === 1}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      ))}
    </group>
  );
};

// --- SUB-COMPONENT: REAL PHYSICAL ELEMENT SPECIMEN 3D ---
interface PhysicalSpecimen3DProps {
  element: ChemicalElement;
  isSpinning: boolean;
  speedMultiplier: number;
  language: 'tr' | 'en';
}

const PhysicalSpecimen3D: React.FC<PhysicalSpecimen3DProps> = ({
  element,
  isSpinning,
  speedMultiplier,
  language
}) => {
  const sampleRef = useRef<THREE.Group>(null);
  const state = element.stateAtSTP;
  const z = element.atomicNumber;

  // Real physical visual style based on element
  const specimenConfig = useMemo(() => {
    if (z === 79) {
      // Gold (Au)
      return { type: 'nugget', color: '#fbbf24', metalness: 0.98, roughness: 0.15, emissive: '#b45309', emissiveInt: 0.2 };
    } else if (z === 29) {
      // Copper (Cu)
      return { type: 'nugget', color: '#f97316', metalness: 0.95, roughness: 0.22, emissive: '#9a3412', emissiveInt: 0.15 };
    } else if (z === 47) {
      // Silver (Ag)
      return { type: 'nugget', color: '#f8fafc', metalness: 0.99, roughness: 0.08, emissive: '#e2e8f0', emissiveInt: 0.1 };
    } else if (z === 6) {
      // Carbon (C Diamond / Graphite)
      return { type: 'crystal', color: '#e0f2fe', metalness: 0.1, roughness: 0.02, transmission: 0.92, ior: 2.42 };
    } else if (z === 16) {
      // Sulfur (S)
      return { type: 'crystal', color: '#eab308', metalness: 0.05, roughness: 0.45, emissive: '#ca8a04', emissiveInt: 0.1 };
    } else if (z === 80) {
      // Mercury (Hg) Liquid Drop
      return { type: 'liquid', color: '#e2e8f0', metalness: 1.0, roughness: 0.01, emissive: '#94a3b8', emissiveInt: 0.1 };
    } else if (z === 35) {
      // Bromine (Br) Liquid
      return { type: 'liquid', color: '#7f1d1d', metalness: 0.1, roughness: 0.1, transmission: 0.75, emissive: '#991b1b', emissiveInt: 0.4 };
    } else if (state === 'gas') {
      // Noble gases and atmospheric gases (Discharge tube)
      let gasGlow = '#60a5fa';
      if (z === 10) gasGlow = '#ff2200'; // Neon intense red-orange
      else if (z === 2) gasGlow = '#fb7185'; // Helium pinkish
      else if (z === 18) gasGlow = '#c084fc'; // Argon violet
      else if (z === 36) gasGlow = '#93c5fd'; // Krypton pale blue
      else if (z === 54) gasGlow = '#38bdf8'; // Xenon blue
      else if (z === 17) gasGlow = '#a3e635'; // Chlorine yellow-green
      return { type: 'gas-tube', color: gasGlow };
    } else {
      // General metallic or crystalline solid
      return {
        type: 'nugget',
        color: element.block === 'd' ? '#cbd5e1' : '#94a3b8',
        metalness: 0.88,
        roughness: 0.25,
        emissive: '#475569',
        emissiveInt: 0.05
      };
    }
  }, [element, z, state]);

  useFrame((stateObj, delta) => {
    if (!isSpinning || !sampleRef.current) return;
    const dt = delta * speedMultiplier;
    sampleRef.current.rotation.y += dt * 0.7;
    sampleRef.current.rotation.x = Math.sin(stateObj.clock.elapsedTime * 0.8) * 0.15;
  });

  return (
    <group>
      {/* Specimen floating body */}
      <group ref={sampleRef} position={[0, 0.4, 0]}>
        {/* CASE A: Metallic Mineral Nugget */}
        {specimenConfig.type === 'nugget' && (
          <mesh castShadow receiveShadow>
            <dodecahedronGeometry args={[1.25, 1]} />
            <meshStandardMaterial
              color={specimenConfig.color}
              metalness={specimenConfig.metalness}
              roughness={specimenConfig.roughness}
              emissive={specimenConfig.emissive}
              emissiveIntensity={specimenConfig.emissiveInt}
              flatShading
            />
          </mesh>
        )}

        {/* CASE B: Faceted Crystal (e.g. Diamond, Sulfur, Silicon) */}
        {specimenConfig.type === 'crystal' && (
          <mesh castShadow receiveShadow>
            <octahedronGeometry args={[1.4, 0]} />
            <meshPhysicalMaterial
              color={specimenConfig.color}
              metalness={specimenConfig.metalness || 0}
              roughness={specimenConfig.roughness || 0.05}
              transmission={specimenConfig.transmission || 0.8}
              ior={specimenConfig.ior || 1.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        )}

        {/* CASE C: Liquid Specimen Droplet (e.g. Mercury, Bromine) */}
        {specimenConfig.type === 'liquid' && (
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshPhysicalMaterial
              color={specimenConfig.color}
              metalness={specimenConfig.metalness}
              roughness={specimenConfig.roughness}
              transmission={specimenConfig.transmission || 0}
              emissive={specimenConfig.emissive}
              emissiveIntensity={specimenConfig.emissiveInt}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>
        )}

        {/* CASE D: Gas Discharge Glass Ampoule (Neon, Xenon, Oxygen, etc.) */}
        {specimenConfig.type === 'gas-tube' && (
          <group>
            {/* Outer Protective Quartz Glass Ampoule */}
            <mesh>
              <cylinderGeometry args={[0.65, 0.65, 2.5, 24]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transmission={0.95}
                roughness={0.05}
                ior={1.5}
                transparent
                opacity={0.3}
              />
            </mesh>
            {/* Glowing Ionized Plasma Core */}
            <mesh>
              <cylinderGeometry args={[0.32, 0.32, 2.2, 16]} />
              <meshBasicMaterial
                color={specimenConfig.color}
                transparent
                opacity={0.85}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* Bright Center Filament */}
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 2.3, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <pointLight color={specimenConfig.color} intensity={3.5} distance={8} />
          </group>
        )}
      </group>

      {/* High-tech Holographic Specimen Pedestal / Display Stand */}
      <group position={[0, -2.4, 0]}>
        {/* Circular base stand */}
        <mesh receiveShadow>
          <cylinderGeometry args={[2.5, 2.8, 0.3, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Glowing holographic energy ring */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.04, 16, 64]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Floating 3D Label: Physical Specimen */}
      <Text
        position={[0, 3.0, 0]}
        fontSize={0.32}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {language === 'tr' ? '3B Fiziksel Numune (Saf Hâli)' : '3D Physical Specimen (Pure State)'}
      </Text>
      <Text
        position={[0, 2.6, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {language === 'tr' ? element.appearance.tr : element.appearance.en}
      </Text>
    </group>
  );
};
