export type ProteinLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface ProteinState {
  status: ProteinLoadStatus;
  metadata: import('@shared/types').ProteinMetadata | null;
  rawData: string | null;
  structureFormat: import('@shared/types').ProteinStructureFormat | null;
  error: string | null;
}

export interface ProteinContextValue extends ProteinState {
  load: (pdbId: string) => Promise<void>;
  reload: () => Promise<void>;
  /** Surface mesh-build failures after a successful fetch */
  reportError: (message: string) => void;
}
