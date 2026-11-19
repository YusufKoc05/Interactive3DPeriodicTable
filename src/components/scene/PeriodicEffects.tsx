import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { usePeriodicStore } from '../../store/usePeriodicStore';

export const PeriodicEffects: React.FC = () => {
  const performanceMode = usePeriodicStore((s) => s.performanceMode);

  // If performance mode is active or user prefers reduced motion, disable post-processing passes
  if (performanceMode) {
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.65}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.7}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.2} darkness={0.6} />
    </EffectComposer>
  );
};
