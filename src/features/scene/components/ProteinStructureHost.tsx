import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, type ReactNode } from 'react';
import type * as THREE from 'three';
import { useManipulationRef } from '../hooks/useManipulationRef';
import { useSceneManager } from '../hooks/useSceneManager';

interface ProteinStructureHostProps {
  /** Changes trigger transform reset (e.g. PDB id) */
  structureKey: string | null;
  children?: ReactNode;
}

/**
 * Scene-side wrapper for protein geometry — owns transform reset and idle spin
 * so the protein feature stays independent of scene hooks.
 */
export function ProteinStructureHost({
  structureKey,
  children,
}: ProteinStructureHostProps) {
  const manager = useSceneManager();
  const manipulationRef = useManipulationRef();
  const spinRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (structureKey) {
      manager.resetTransform();
    }
  }, [structureKey, manager]);

  useFrame((_, delta) => {
    if (!spinRef.current || manipulationRef.current.isActive) return;
    spinRef.current.rotation.y += delta * 0.05;
  });

  return <group ref={spinRef}>{children}</group>;
}
