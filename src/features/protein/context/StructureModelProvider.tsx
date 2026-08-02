import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { buildPickIndex } from '../core/buildPickIndex';
import { centerStructureModel } from '../core/structureBounds';
import { useProtein } from '../hooks/useProtein';
import { useSelection } from '../hooks/useSelection';
import { annotateSecondaryStructure } from '../parsers/annotateSecondaryStructure';
import { parseStructureModel } from '../parsers/parseStructureModel';
import { StructureModelContext } from './StructureModelContext';

interface StructureModelProviderProps {
  children: ReactNode;
}

/**
 * Parses and indexes the loaded structure for picking — mirrors buildProteinGroup
 * preprocessing without constructing Three.js geometry.
 */
export function StructureModelProvider({ children }: StructureModelProviderProps) {
  const { status, rawData, structureFormat, metadata } = useProtein();
  const { clearSelection } = useSelection();

  const structureKey =
    status === 'loaded' && metadata ? metadata.pdbId : null;

  const value = useMemo(() => {
    if (status !== 'loaded' || !rawData) {
      return null;
    }

    const model = parseStructureModel(rawData, structureFormat ?? 'pdb');
    annotateSecondaryStructure(model, rawData);
    centerStructureModel(model);
    const pickIndex = buildPickIndex(model);

    return { model, pickIndex };
  }, [status, rawData, structureFormat]);

  useEffect(() => {
    clearSelection();
  }, [structureKey, clearSelection]);

  return (
    <StructureModelContext.Provider value={value}>
      {children}
    </StructureModelContext.Provider>
  );
}
