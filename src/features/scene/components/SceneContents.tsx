import { PerspectiveCamera } from '@react-three/drei';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import { useSceneManager } from '../hooks/useSceneManager';
import { ManipulationProvider } from './ManipulationProvider';
import { DevOrbitControls, SceneRendererSetup } from './SceneHelpers';
import { HolographicGrid, HolographicReference } from './HolographicReference';
import { ProteinTransformGroup } from './ProteinTransformGroup';
import { SceneLights } from './SceneLights';

interface SceneContentsProps {
  /** Content rendered inside the protein transform group (e.g. loaded structure) */
  proteinContent?: ReactNode;
}

function SceneCameraRig() {
  const manager = useSceneManager();
  const { camera } = manager.config;
  const ref = useRef<THREE.PerspectiveCamera>(null);

  useLayoutEffect(() => {
    ref.current?.lookAt(...camera.lookAt);
  }, [camera.lookAt]);

  return (
    <PerspectiveCamera
      ref={ref}
      makeDefault
      fov={camera.fov}
      near={camera.near}
      far={camera.far}
      position={camera.position}
    />
  );
}

/**
 * All objects inside the R3F Canvas — lights, reference geometry,
 * protein group, and dev controls.
 */
export function SceneContents({ proteinContent }: SceneContentsProps) {
  return (
    <ManipulationProvider>
      <SceneCameraRig />

      <SceneRendererSetup />
      <SceneLights />

      <HolographicGrid />

      <ProteinTransformGroup>
        {proteinContent ?? <HolographicReference />}
      </ProteinTransformGroup>

      <DevOrbitControls />
    </ManipulationProvider>
  );
}
