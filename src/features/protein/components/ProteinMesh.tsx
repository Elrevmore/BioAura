import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { applyRepresentationVisibility } from '../core/applyRepresentationVisibility';
import { disposeThreeObject } from '../core/disposeThreeObject';
import { useProtein } from '../hooks/useProtein';
import { useRepresentation } from '../hooks/useRepresentation';

interface ProteinMeshProps {
  pdbText: string;
  format?: import('@shared/types').ProteinStructureFormat;
}

/**
 * Renders a PDB structure — PDBLoader chunk is lazy-loaded on demand.
 */
export function ProteinMesh({ pdbText, format = 'pdb' }: ProteinMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { reportError } = useProtein();
  const { representation } = useRepresentation();
  const [proteinGroup, setProteinGroup] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let disposed = false;
    let built: THREE.Group | null = null;

    void import('../core/buildProteinGroup')
      .then(({ buildProteinGroup }) => {
        if (disposed) return;
        built = buildProteinGroup(pdbText, format);
        setProteinGroup(built);
      })
      .catch((err: unknown) => {
        if (disposed) return;
        const message =
          err instanceof Error ? err.message : 'Failed to build protein geometry';
        console.error('[ProteinMesh]', message, err);
        reportError(message);
      });

    return () => {
      disposed = true;
      if (built) {
        built.removeFromParent();
        disposeThreeObject(built);
        built = null;
      }
      setProteinGroup(null);
    };
  }, [format, pdbText, reportError]);

  useEffect(() => {
    if (!proteinGroup) return;
    applyRepresentationVisibility(proteinGroup, representation);
  }, [proteinGroup, representation]);

  if (!proteinGroup) {
    return null;
  }

  return <primitive ref={groupRef} object={proteinGroup} dispose={null} />;
}
