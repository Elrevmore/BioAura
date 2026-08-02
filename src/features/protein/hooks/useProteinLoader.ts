import { DEFAULT_PROTEIN } from '@shared/config';
import { useCallback, useEffect, useRef, useState } from 'react';
import { proteinLoaderRegistry } from '../loaders/ProteinLoaderRegistry';
import type { ProteinContextValue, ProteinLoadStatus } from '../types/protein-feature.types';
import type { ProteinMetadata } from '@shared/types';

const INITIAL_STATUS: ProteinLoadStatus = 'idle';

export function useProteinLoader(defaultPdbId: string = DEFAULT_PROTEIN.pdbId): ProteinContextValue {
  const [status, setStatus] = useState<ProteinLoadStatus>(INITIAL_STATUS);
  const [metadata, setMetadata] = useState<ProteinMetadata | null>(null);
  const [rawData, setRawData] = useState<string | null>(null);
  const [structureFormat, setStructureFormat] = useState<
    import('@shared/types').ProteinStructureFormat | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const currentIdRef = useRef(defaultPdbId);

  const load = useCallback(async (pdbId: string) => {
    const id = pdbId.toUpperCase().trim();
    currentIdRef.current = id;

    setStatus('loading');
    setError(null);

    try {
      const result = await proteinLoaderRegistry.load(id, 'pdb');

      if (currentIdRef.current !== id) return;

      setMetadata(result.metadata);
      setRawData(result.rawData);
      setStructureFormat(result.format);
      setStatus('loaded');
    } catch (err) {
      if (currentIdRef.current !== id) return;

      const message = err instanceof Error ? err.message : 'Failed to load protein';
      setError(message);
      setStatus('error');
      setMetadata(null);
      setRawData(null);
      setStructureFormat(null);
    }
  }, []);

  const reload = useCallback(async () => {
    await load(currentIdRef.current);
  }, [load]);

  const reportError = useCallback((message: string) => {
    setError(message);
    setStatus('error');
  }, []);

  useEffect(() => {
    void load(defaultPdbId);
  }, [defaultPdbId, load]);

  return {
    status,
    metadata,
    rawData,
    structureFormat,
    error,
    load,
    reload,
    reportError,
  };
}
