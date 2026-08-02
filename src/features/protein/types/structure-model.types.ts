import type { ProteinStructureFormat } from '@shared/types';

/** Secondary-structure classification for polymer residues. */
export type SecondaryStructureType = 'helix' | 'sheet' | 'coil';

/** PDB/mmCIF record group for an atom site. */
export type StructureRecordGroup = 'ATOM' | 'HETATM';

export interface StructureAtom {
  /** Atom name (e.g. CA, N, O). */
  name: string;
  /** Element symbol (e.g. C, N, O). */
  element: string;
  x: number;
  y: number;
  z: number;
  recordGroup: StructureRecordGroup;
  /** True for standard protein-polymer ATOM records. */
  isPolymer: boolean;
}

export interface StructureResidue {
  name: string;
  /** Sequence identifier as stored in the source record (string for mmCIF "."). */
  seqId: string;
  /** Numeric sequence index for ordering when parseable. */
  seqNumber: number;
  insertionCode?: string;
  recordGroup: StructureRecordGroup;
  isPolymer: boolean;
  /** Assigned during secondary-structure annotation; coil when unannotated. */
  secondaryStructure?: SecondaryStructureType;
  atoms: StructureAtom[];
}

export interface StructureChain {
  chainId: string;
  residues: StructureResidue[];
}

/**
 * Normalized macromolecular structure — representation-independent input for
 * cartoon, ball-and-stick, and secondary-structure renderers.
 */
export interface StructureModel {
  format: ProteinStructureFormat;
  chains: StructureChain[];
}
