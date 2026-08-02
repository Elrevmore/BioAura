import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import { useSceneManager } from '../hooks/useSceneManager';

interface ProteinTransformGroupProps {
  children?: ReactNode;
}

/**
 * Root group for the protein mesh. Reads transform state from SceneManager
 * and applies it each frame — ready for gesture control in Phase 7.
 */
export function ProteinTransformGroup({ children }: ProteinTransformGroupProps) {
  const manager = useSceneManager();
  const ref = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const apply = () => {
      if (ref.current) {
        manager.applyToGroup(ref.current);
      }
    };

    apply();
    return manager.subscribe(apply);
  }, [manager]);

  return (
    <group ref={ref} name="protein-root">
      {children}
    </group>
  );
}
