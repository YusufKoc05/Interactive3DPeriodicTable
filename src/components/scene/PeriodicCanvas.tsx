import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { usePeriodicStore } from '../../store/usePeriodicStore';
import { SceneBackground } from './SceneBackground';
import { ElementCard3D } from './ElementCard3D';
import { CameraController } from './CameraController';
import { AtomViewer3D } from './AtomViewer3D';
import { PeriodicEffects } from './PeriodicEffects';
import { getElementTargetPosition } from '../../utils/elementCalculators';

export const PeriodicCanvas: React.FC = () => {
  const elements = usePeriodicStore((s) => s.elements);
  const selectedElement = usePeriodicStore((s) => s.selectedElement);
  const setSelectedElement = usePeriodicStore((s) => s.setSelectedElement);
  const viewLayout = usePeriodicStore((s) => s.viewLayout);

  const atomPosition = selectedElement
    ? getElementTargetPosition(selectedElement, viewLayout)
    : [0, 0, 0];

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 36], fov: 50, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false
        }}
        dpr={[1, 2]}
        onPointerMissed={() => setSelectedElement(null)}
      >
        <Suspense fallback={null}>
          <SceneBackground />
          <CameraController />

          {/* 118 Interactive 3D Chemical Element Cards */}
          <group>
            {elements.map((element) => (
              <ElementCard3D key={element.atomicNumber} element={element} />
            ))}
          </group>

          {/* Interactive 3D Atom Model for Selected Element */}
          {selectedElement && (
            <AtomViewer3D
              key={selectedElement.atomicNumber}
              element={selectedElement}
              position={[atomPosition[0], atomPosition[1], atomPosition[2] + 2.5]}
            />
          )}

          {/* Post-processing Bloom & Vignette Effects */}
          <PeriodicEffects />
        </Suspense>
      </Canvas>
    </div>
  );
};
