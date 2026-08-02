import type { StructureAtom, StructureModel, StructureResidue } from '../../types/structure-model.types';
import type { InteractionCandidate } from './InteractionCandidate';
import type { InteractionResult } from './InteractionResult';

export type InteractionSelection =
  | {
      kind: 'atom';
      atom: StructureAtom;
      residue: StructureResidue;
      chainId: string;
    }
  | {
      kind: 'residue';
      residue: StructureResidue;
      chainId: string;
    }
  | {
      kind: 'ligand';
      residue: StructureResidue;
      chainId: string;
    };

export interface InteractionQuery {
  model: StructureModel;
  selection: InteractionSelection;
  radiusAngstrom?: number;
}

export interface InteractionAnalysisOutput {
  candidates: InteractionCandidate[];
  interactions: InteractionResult[];
}
