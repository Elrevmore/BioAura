import { useCallback } from 'react';
import type { ProteinSearchResult } from '../types/protein-discovery.types';
import { useProtein } from './useProtein';

/**
 * Bridges protein discovery search selection to the existing loader pipeline.
 */
export function useProteinSearchSelection() {
  const { load } = useProtein();

  const onSelect = useCallback(
    (result: ProteinSearchResult) => {
      void load(result.pdbId);
    },
    [load],
  );

  return { onSelect };
}
