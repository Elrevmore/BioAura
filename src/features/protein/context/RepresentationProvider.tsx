import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { RepresentationContext } from './RepresentationContext';
import {
  DEFAULT_PROTEIN_REPRESENTATION,
  type ProteinRepresentationState,
  type RepresentationLayerId,
} from '../types/representation.types';

interface RepresentationProviderProps {
  children: ReactNode;
}

export function RepresentationProvider({ children }: RepresentationProviderProps) {
  const [representation, setRepresentationState] = useState<ProteinRepresentationState>(
    () => ({ ...DEFAULT_PROTEIN_REPRESENTATION }),
  );

  const setLayerVisible = useCallback((layerId: RepresentationLayerId, visible: boolean) => {
    setRepresentationState((prev) => {
      if (prev[layerId] === visible) {
        return prev;
      }
      return { ...prev, [layerId]: visible };
    });
  }, []);

  const setRepresentation = useCallback((update: Partial<ProteinRepresentationState>) => {
    setRepresentationState((prev) => ({ ...prev, ...update }));
  }, []);

  const value = useMemo(
    () => ({ representation, setLayerVisible, setRepresentation }),
    [representation, setLayerVisible, setRepresentation],
  );

  return (
    <RepresentationContext.Provider value={value}>{children}</RepresentationContext.Provider>
  );
}
