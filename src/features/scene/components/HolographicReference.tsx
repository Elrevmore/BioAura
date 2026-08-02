import { Grid, Icosahedron } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

/**
 * Holographic reference object shown until the protein loads (Phase 6).
 * A slowly rotating wireframe icosahedron with cyan emissive material.
 */
export function HolographicReference() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
      meshRef.current.rotation.x += delta * 0.08;
    }
  });

  return (
    <Icosahedron ref={meshRef} args={[1.8, 1]}>
      <meshStandardMaterial
        color={0x22d3ee}
        emissive={0x0891b2}
        emissiveIntensity={0.6}
        wireframe
        transparent
        opacity={0.55}
      />
    </Icosahedron>
  );
}

/** Subtle holographic floor grid */
export function HolographicGrid() {
  return (
    <Grid
      args={[20, 20]}
      cellSize={0.5}
      cellThickness={0.4}
      cellColor="#22d3ee"
      sectionSize={2}
      sectionThickness={0.8}
      sectionColor="#8b5cf6"
      fadeDistance={18}
      fadeStrength={1.2}
      followCamera={false}
      position={[0, -3, 0]}
    />
  );
}
