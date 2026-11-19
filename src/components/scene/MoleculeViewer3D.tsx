import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ChemicalCompound } from '../../types/advancedFeatures';

interface MoleculeViewer3DProps {
  compound: ChemicalCompound;
  isSpinning?: boolean;
}

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({ compound, isSpinning = true }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && isSpinning) {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.x += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
      {/* 1. Chemical Bonds (Cylinders) */}
      {compound.bonds.map((bond, idx) => {
        const atom1 = compound.atoms[bond.fromIndex];
        const atom2 = compound.atoms[bond.toIndex];
        if (!atom1 || !atom2) return null;

        const p1 = new THREE.Vector3(...atom1.position);
        const p2 = new THREE.Vector3(...atom2.position);
        const dir = new THREE.Vector3().subVectors(p2, p1);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const orientation = new THREE.Matrix4();
        orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
        const rot = new THREE.Euler().setFromRotationMatrix(orientation);

        // Determine bond color based on bond type
        const bondColor =
          bond.type === 'ionic'
            ? '#f59e0b'
            : bond.type === 'polar_covalent'
            ? '#06b6d4'
            : '#94a3b8';

        // Single, Double, Triple bond visual representation
        if (bond.order === 2) {
          return (
            <group key={`bond-double-${idx}`} position={mid} rotation={rot}>
              <Cylinder args={[0.04, 0.04, len, 12]} position={[0.07, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.3} />
              </Cylinder>
              <Cylinder args={[0.04, 0.04, len, 12]} position={[-0.07, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.3} />
              </Cylinder>
            </group>
          );
        }

        if (bond.order === 3) {
          return (
            <group key={`bond-triple-${idx}`} position={mid} rotation={rot}>
              <Cylinder args={[0.035, 0.035, len, 12]} position={[0.08, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.3} />
              </Cylinder>
              <Cylinder args={[0.035, 0.035, len, 12]} position={[-0.08, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.3} />
              </Cylinder>
              <Cylinder args={[0.035, 0.035, len, 12]} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={bondColor} metalness={0.5} roughness={0.3} />
              </Cylinder>
            </group>
          );
        }

        return (
          <group key={`bond-${idx}`} position={mid} rotation={rot}>
            <Cylinder args={[0.06, 0.06, len, 12]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color={bondColor} metalness={0.4} roughness={0.3} />
            </Cylinder>
          </group>
        );
      })}

      {/* 2. Atoms (CPK Spheres) */}
      {compound.atoms.map((atom, idx) => {
        const radius = atom.elementSymbol === 'H' ? 0.28 : 0.42;
        const color = atom.cpkColor || '#94a3b8';

        return (
          <group key={`atom-${idx}`} position={atom.position}>
            <Sphere args={[radius, 32, 32]}>
              <meshPhysicalMaterial
                color={color}
                roughness={0.15}
                metalness={0.1}
                clearcoat={0.6}
                clearcoatRoughness={0.1}
              />
            </Sphere>
            <Text
              position={[0, 0, radius + 0.05]}
              fontSize={0.22}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {atom.label || atom.elementSymbol}
            </Text>
          </group>
        );
      })}
    </group>
  );
};
