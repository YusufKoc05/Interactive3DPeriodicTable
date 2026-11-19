import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import { getElementTargetPosition } from '../../utils/elementCalculators';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const selectedElement = usePeriodicStore((s) => s.selectedElement);
  const viewLayout = usePeriodicStore((s) => s.viewLayout);

  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 38));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Determine ideal camera distance per layout
  useEffect(() => {
    if (selectedElement) {
      // Focus closely on the selected element
      const [ex, ey, ez] = getElementTargetPosition(selectedElement, viewLayout);
      targetLookAt.current.set(ex, ey, ez);

      // Camera positioned slightly in front and offset for info card space
      if (viewLayout === 'sphere') {
        const norm = new THREE.Vector3(ex, ey, ez).normalize();
        targetCameraPos.current.copy(norm.multiplyScalar(24));
      } else {
        targetCameraPos.current.set(ex + 1.5, ey, ez + 7.5);
      }
    } else {
      // Overview perspective based on layout
      targetLookAt.current.set(0, 0, 0);
      switch (viewLayout) {
        case 'table':
          targetCameraPos.current.set(0, 0, 36);
          break;
        case 'flat':
          targetCameraPos.current.set(0, 0, 36);
          break;
        case 'sphere':
          targetCameraPos.current.set(0, 0, 38);
          break;
        case 'helix':
          targetCameraPos.current.set(24, 0, 32);
          break;
      }
    }
  }, [selectedElement, viewLayout]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // Smooth lerp camera position
    const lerpSpeed = Math.min(delta * 4.5, 1);
    camera.position.lerp(targetCameraPos.current, lerpSpeed);

    // Smooth lerp orbit target
    controlsRef.current.target.lerp(targetLookAt.current, lerpSpeed);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxDistance={90}
      minDistance={4}
      autoRotate={!selectedElement}
      autoRotateSpeed={0.4}
      maxPolarAngle={Math.PI / 1.85}
      minPolarAngle={Math.PI / 6}
    />
  );
};
