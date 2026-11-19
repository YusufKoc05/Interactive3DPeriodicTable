import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ChemicalElement } from '../../types/element';
import { getLatticeDataForStructure } from '../../utils/crystalGenerators';
import { CATEGORY_COLORS } from '../../utils/elementCalculators';

interface CrystalLattice3DProps {
  element: ChemicalElement;
  animationSpeed?: number;
  isSpinning?: boolean;
}

export const CrystalLattice3D: React.FC<CrystalLattice3DProps> = ({
  element,
  animationSpeed = 1,
  isSpinning = true
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const lattice = useMemo(() => {
    return getLatticeDataForStructure(element.crystalStructure || 'FCC');
  }, [element.crystalStructure]);

  const elementColor = useMemo(() => {
    return CATEGORY_COLORS[element.category] || '#38bdf8';
  }, [element.category]);

  useFrame((_, delta) => {
    if (groupRef.current && isSpinning) {
      groupRef.current.rotation.y += delta * 0.45 * animationSpeed;
      groupRef.current.rotation.x += delta * 0.15 * animationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.1}>
      {/* 1. Unit Cell Bounding Box Wireframe */}
      <mesh>
        <boxGeometry args={lattice.boxBounds} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.25} />
      </mesh>

      {/* 2. Lattice Bonds (Cylinders between lattice sites) */}
      {lattice.bonds.map((bond, idx) => {
        const p1 = new THREE.Vector3(...bond.from);
        const p2 = new THREE.Vector3(...bond.to);
        const dir = new THREE.Vector3().subVectors(p2, p1);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const orientation = new THREE.Matrix4();
        orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
        const rot = new THREE.Euler().setFromRotationMatrix(orientation);

        return (
          <group key={`bond-${idx}`} position={mid} rotation={rot}>
            <Cylinder args={[0.022, 0.022, len, 8]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial
                color="#64748b"
                metalness={0.7}
                roughness={0.3}
                transparent
                opacity={0.75}
              />
            </Cylinder>
          </group>
        );
      })}

      {/* 3. Lattice Atoms (Spheres) */}
      {lattice.atoms.map((atom) => {
        let sphereColor = elementColor;
        let radius = 0.22;

        if (atom.isBody) {
          sphereColor = '#f59e0b'; // Amber for center atom
          radius = 0.24;
        } else if (atom.isFace) {
          sphereColor = '#06b6d4'; // Cyan for face center
          radius = 0.21;
        } else {
          sphereColor = elementColor; // Corner atoms
          radius = 0.19;
        }

        return (
          <group key={atom.id} position={atom.position}>
            <Sphere args={[radius, 24, 24]}>
              <meshPhysicalMaterial
                color={sphereColor}
                metalness={0.65}
                roughness={0.2}
                clearcoat={0.8}
                clearcoatRoughness={0.1}
                emissive={sphereColor}
                emissiveIntensity={0.25}
              />
            </Sphere>
          </group>
        );
      })}

      {/* Floating System Name Tag */}
      <Text
        position={[0, -lattice.boxBounds[1] / 2 - 0.5, 0]}
        fontSize={0.25}
        color="#94a3b8"
        anchorX="center"
        anchorY="top"
      >
        {lattice.nameTr}
      </Text>
    </group>
  );
};
