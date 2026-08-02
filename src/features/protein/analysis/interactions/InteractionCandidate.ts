import type {
  StructureAtom,
  StructureResidue,
} from '../../types/structure-model.types';

/**
 * Atom pair produced by neighbor search + candidate generation.
 * Consumed by interaction analyzer plugins.
 */
export interface InteractionCandidate {
  sourceAtom: StructureAtom;
  targetAtom: StructureAtom;
  sourceResidue: StructureResidue;
  targetResidue: StructureResidue;
  sourceChainId: string;
  targetChainId: string;
  distanceAngstrom: number;
}
