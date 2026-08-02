import type { SecondaryStructureType } from '../types/structure-model.types';

/** Inclusive residue range mapped from PDB/mmCIF secondary-structure records. */
export interface SecondaryStructureRange {
  type: Exclude<SecondaryStructureType, 'coil'>;
  chainId: string;
  startSeqId: string;
  startInsertionCode?: string;
  endSeqId: string;
  endInsertionCode?: string;
}
