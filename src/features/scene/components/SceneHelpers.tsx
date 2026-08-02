import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useManipulationRef } from '../hooks/useManipulationRef';
import { useSceneManager } from '../hooks/useSceneManager';

/**
 * Development-only orbit controls for inspecting the scene.
 * Automatically disabled while gesture manipulation is active.
 */
export function DevOrbitControls() {
  const manager = useSceneManager();
  const manipulationRef = useManipulationRef();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !manipulationRef.current.isActive;
    }
  });

  if (!manager.config.enableOrbitControls) {
    return null;
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={4}
      maxDistance={40}
      maxPolarAngle={Math.PI * 0.85}
      target={[0, 0, 0]}
    />
  );
}

/** Applies renderer settings from SceneRenderer config to the R3F canvas */
export function SceneRendererSetup() {
  const { gl, scene } = useThree();
  const manager = useSceneManager();
  const { renderer: rendererConfig } = manager.config;

  useEffect(() => {
    gl.setClearColor(rendererConfig.backgroundColor, 1);
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
    scene.fog = new THREE.FogExp2(rendererConfig.backgroundColor, 0.035);

    return () => {
      scene.fog = null;
    };
  }, [gl, scene, rendererConfig.backgroundColor]);

  return null;
}
