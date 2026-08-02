import type {
  StructureAtom,
  StructureResidue,
} from '../../types/structure-model.types';
import type { InteractionType } from './InteractionTypes';

/**
 * Generic interaction record — reused unchanged by all analyzer plugins.
 */
export interface InteractionResult {
  type: InteractionType;
  sourceAtom: StructureAtom;
  targetAtom: StructureAtom;
  sourceResidue: StructureResidue;
  targetResidue: StructureResidue;
  sourceChainId: string;
  targetChainId: string;
  distanceAngstrom: number;
  /** Normalized confidence score in [0, 1]. */
  confidence: number;
  reason: string;
}
