import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ChemicalElement } from '../../types/element';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import {
  getElementColor,
  getElementTargetPosition,
  getPhysicalStateAtTemp
} from '../../utils/elementCalculators';
import { sound } from '../../audio/soundEngine';

interface ElementCard3DProps {
  element: ChemicalElement;
}

export const ElementCard3D: React.FC<ElementCard3DProps> = ({ element }) => {
  const meshRef = useRef<THREE.Group>(null);

  const selectedElement = usePeriodicStore((s) => s.selectedElement);
  const hoveredElement = usePeriodicStore((s) => s.hoveredElement);
  const setSelectedElement = usePeriodicStore((s) => s.setSelectedElement);
  const setHoveredElement = usePeriodicStore((s) => s.setHoveredElement);
  const viewLayout = usePeriodicStore((s) => s.viewLayout);
  const colorMode = usePeriodicStore((s) => s.colorMode);
  const temperature = usePeriodicStore((s) => s.temperature);
  const filterCategory = usePeriodicStore((s) => s.filterCategory);
  const filterBlock = usePeriodicStore((s) => s.filterBlock);
  const filterState = usePeriodicStore((s) => s.filterState);
  const searchQuery = usePeriodicStore((s) => s.searchQuery);
  const language = usePeriodicStore((s) => s.language);

  const isSelected = selectedElement?.atomicNumber === element.atomicNumber;
  const isHovered = hoveredElement?.atomicNumber === element.atomicNumber;

  // Filter check
  const isMatchingFilter = useMemo(() => {
    if (filterCategory !== 'all' && element.category !== filterCategory) return false;
    if (filterBlock !== 'all' && element.block !== filterBlock) return false;
    if (filterState !== 'all') {
      const currentState = getPhysicalStateAtTemp(element, temperature);
      if (currentState !== filterState) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        element.symbol.toLowerCase().includes(q) ||
        element.name.tr.toLowerCase().includes(q) ||
        element.name.en.toLowerCase().includes(q) ||
        element.atomicNumber.toString() === q;
      if (!match) return false;
    }
    return true;
  }, [element, filterCategory, filterBlock, filterState, temperature, searchQuery]);

  // Color calculation
  const accentColorHex = useMemo(() => {
    return getElementColor(element, colorMode, temperature);
  }, [element, colorMode, temperature]);

  const accentColor = useMemo(() => new THREE.Color(accentColorHex), [accentColorHex]);
  const darkGlassColor = useMemo(() => new THREE.Color('#060913'), []);
  const dimmedBorderColor = useMemo(() => new THREE.Color('#1e293b'), []);

  // Target position based on current layout
  const baseTargetPos = useMemo(() => {
    return new THREE.Vector3(...getElementTargetPosition(element, viewLayout));
  }, [element, viewLayout]);

  // Card dimensions
  const CARD_WIDTH = 2.05;
  const CARD_HEIGHT = 2.25;
  const CARD_DEPTH = 0.22;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const factor = Math.min(delta * 7.5, 1);

    // Compute dynamic hover displacement
    const targetPos = baseTargetPos.clone();
    if (isSelected) {
      targetPos.z += 1.2;
    } else if (isHovered) {
      targetPos.z += 0.75;
    }

    meshRef.current.position.lerp(targetPos, factor);

    // Dynamic floating rotation & tilt
    if (viewLayout === 'sphere') {
      meshRef.current.lookAt(
        meshRef.current.position.x * 2,
        meshRef.current.position.y * 2,
        meshRef.current.position.z * 2
      );
    } else if (viewLayout === 'helix') {
      meshRef.current.lookAt(
        meshRef.current.position.x * 2,
        meshRef.current.position.y,
        meshRef.current.position.z * 2
      );
    } else {
      // Dynamic micro-tilt when hovered
      const time = state.clock.elapsedTime;
      const tiltX = isHovered ? Math.sin(time * 3) * 0.08 : 0;
      const tiltY = isHovered ? Math.cos(time * 3) * 0.08 : 0;

      const targetQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(tiltX, tiltY, 0)
      );
      meshRef.current.quaternion.slerp(targetQuat, factor);
    }

    // Dynamic scale
    const targetScale = isSelected ? 1.25 : isHovered ? 1.14 : isMatchingFilter ? 1.0 : 0.88;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      Math.min(delta * 12, 1)
    );
  });

  const borderColor = isSelected
    ? '#38bdf8'
    : isHovered
    ? '#ffffff'
    : isMatchingFilter
    ? accentColor
    : dimmedBorderColor;

  const symbolColor = isSelected
    ? '#38bdf8'
    : isMatchingFilter
    ? accentColorHex
    : '#475569';

  const displayName = language === 'tr' ? element.name.tr : element.name.en;

  return (
    <group
      ref={meshRef}
      position={baseTargetPos}
      onClick={(e) => {
        e.stopPropagation();
        sound.playSelect();
        setSelectedElement(element);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        sound.playHover(element.atomicNumber);
        setHoveredElement(element);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHoveredElement(null);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Dark Smoked Frosted Glass Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH]} />
        <meshPhysicalMaterial
          color={darkGlassColor}
          emissive={accentColor}
          emissiveIntensity={isSelected ? 0.35 : isHovered ? 0.22 : isMatchingFilter ? 0.04 : 0}
          roughness={0.18}
          metalness={0.65}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
          transparent
          opacity={isMatchingFilter ? 0.94 : 0.25}
        />
      </mesh>

      {/* 2. Neon Glowing Outline Border */}
      <lineSegments position={[0, 0, CARD_DEPTH / 2 + 0.005]}>
        <edgesGeometry args={[new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, 0.01)]} />
        <lineBasicMaterial
          color={borderColor}
          transparent
          opacity={isSelected ? 1.0 : isHovered ? 0.95 : isMatchingFilter ? 0.75 : 0.15}
          linewidth={2}
        />
      </lineSegments>

      {/* 3. Subtle Inner Glowing Plane */}
      <mesh position={[0, 0, CARD_DEPTH / 2 + 0.003]}>
        <planeGeometry args={[CARD_WIDTH - 0.08, CARD_HEIGHT - 0.08]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={isSelected ? 0.22 : isHovered ? 0.14 : isMatchingFilter ? 0.05 : 0.01}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Atomic Number - Top Left */}
      <Text
        position={[-CARD_WIDTH / 2 + 0.22, CARD_HEIGHT / 2 - 0.22, CARD_DEPTH / 2 + 0.02]}
        fontSize={0.28}
        color={isMatchingFilter ? '#ffffff' : '#64748b'}
        anchorX="left"
        anchorY="top"
        fontWeight="bold"
      >
        {element.atomicNumber}
      </Text>

      {/* 5. Atomic Mass - Top Right */}
      <Text
        position={[CARD_WIDTH / 2 - 0.2, CARD_HEIGHT / 2 - 0.24, CARD_DEPTH / 2 + 0.02]}
        fontSize={0.18}
        color={isMatchingFilter ? '#94a3b8' : '#475569'}
        anchorX="right"
        anchorY="top"
      >
        {element.atomicMass.toFixed(1)}
      </Text>

      {/* 6. Big Luminous Chemical Symbol - Center */}
      <Text
        position={[0, 0.08, CARD_DEPTH / 2 + 0.02]}
        fontSize={0.82}
        color={symbolColor}
        anchorX="center"
        anchorY="middle"
        fontWeight="black"
      >
        {element.symbol}
      </Text>

      {/* 7. Element Name - Bottom */}
      <Text
        position={[0, -CARD_HEIGHT / 2 + 0.32, CARD_DEPTH / 2 + 0.02]}
        fontSize={0.21}
        color={isMatchingFilter ? '#f1f5f9' : '#475569'}
        anchorX="center"
        anchorY="bottom"
        maxWidth={CARD_WIDTH - 0.25}
      >
        {displayName}
      </Text>
    </group>
  );
};
