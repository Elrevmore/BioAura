export { InteractionEngine, interactionEngine } from './InteractionEngine';
export type { InteractionCandidate } from './InteractionCandidate';
export type { InteractionResult } from './InteractionResult';
export type { InteractionAnalyzer, InteractionAnalysisContext } from './InteractionAnalyzer';
export type { InteractionQuery, InteractionSelection, InteractionAnalysisOutput } from './InteractionQuery';
export {
  InteractionType,
  INTERACTION_TYPE_REGISTRY,
  getAllInteractionTypes,
  getInteractionTypeDescriptor,
} from './InteractionTypes';
export type { InteractionTypeDescriptor } from './InteractionTypes';
export {
  InteractionRegistry,
  defaultInteractionRegistry,
} from './InteractionRegistry';
export {
  applyFilters,
  composeFilters,
  differentChain,
  differentResidue,
  sameChain,
  sameResidue,
  withinDistance,
} from './GeometryFilters';
export type { CandidateFilter } from './GeometryFilters';
export {
  buildInteractionCandidates,
  resolveSourceAtoms,
} from './buildInteractionCandidates';
export type { SourceAtomRef } from './buildInteractionCandidates';
export {
  buildInteractionQuery,
  selectionToInteractionSelection,
} from './buildInteractionQuery';
export {
  AMINO_ACID_DONOR_ACCEPTOR,
  COMMON_ACCEPTOR_ATOM_NAMES,
  COMMON_DONOR_ATOM_NAMES,
  LIGAND_COMPATIBILITY_RULES,
  WATER_HANDLING_RULES,
  isAcceptorAtom,
  isCommonAcceptorAtom,
  isCommonDonorAtom,
  isCrystallographicWater,
  isDonorAtom,
  isLigandCompatibleResidue,
  lookupDonorAcceptorRole,
  normalizeAtomName,
  normalizeResidueName,
} from './donorAcceptorDatabase';
export type { DonorAcceptorRole } from './donorAcceptorDatabase';
export { hydrogenBondAnalyzer } from './HydrogenBondAnalyzer';
export {
  HYDROGEN_BOND_MAX_DISTANCE_ANGSTROM,
  HYDROGEN_BOND_REASON,
  calculateHydrogenBondConfidence,
} from './hydrogenBondConfidence';
export {
  buildHydrogenBondInspectorRows,
  getHydrogenBondInteractions,
  hydrogenBondEmptyMessage,
} from './inspectorInteractionDisplay';
export type { InspectorInteractionRow } from './inspectorInteractionDisplay';
import './registerDefaultInteractionAnalyzers';
