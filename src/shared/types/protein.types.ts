export type ProteinStructureFormat = 'pdb' | 'mmcif';

export interface ProteinLoadOptions {
  format?: ProteinStructureFormat;
}

export interface ProteinMetadata {
  pdbId: string;
  name: string;
  organism: string;
  function: string;
  chainCount: number;
  aminoAcidCount: number;
}

export interface ProteinLoadResult {
  metadata: ProteinMetadata;
  /** Raw structure data — format-specific until unified mesh is built */
  rawData: string;
  format: ProteinStructureFormat;
}

export interface ProteinLoader {
  readonly supportedFormats: readonly ProteinStructureFormat[];
  load(sourceId: string, options?: ProteinLoadOptions): Promise<ProteinLoadResult>;
}

export interface ProteinTransform {
  rotation: { x: number; y: number; z: number };
  scale: number;
  position: { x: number; y: number; z: number };
}
