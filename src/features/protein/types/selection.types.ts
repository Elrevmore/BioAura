import type {
  StructureAtom,
  StructureChain,
  StructureResidue,
} from './structure-model.types';

/** Current selection granularity. */
export type SelectionType = 'none' | 'atom' | 'residue' | 'chain' | 'ligand';

/**
 * Reserved for future tools — design-only, not used in Phase 5.
 * Interaction, pocket, surface patch, and mutation tools will extend this union.
 */
export type FutureSelectionType =
  | 'interaction'
  | 'pocket'
  | 'surface-patch'
  | 'mutation';

export interface AtomSelection {
  type: 'atom';
  chainId: string;
  residue: StructureResidue;
  atom: StructureAtom;
}

export interface ResidueSelection {
  type: 'residue';
  chainId: string;
  residue: StructureResidue;
}

export interface ChainSelection {
  type: 'chain';
  chain: StructureChain;
}

export interface LigandSelection {
  type: 'ligand';
  chainId: string;
  residue: StructureResidue;
}

export type SelectedObject =
  | AtomSelection
  | ResidueSelection
  | ChainSelection
  | LigandSelection;

export interface SelectionState {
  selectionType: SelectionType;
  selectedObject: SelectedObject | null;
  /** Ordered atom picks for measurement (max 4). */
  atomSelections: AtomSelection[];
}

/** Maximum ordered atom selections for distance / angle / dihedral tools. */
export const MAX_ATOM_SELECTIONS = 4;
