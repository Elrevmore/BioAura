export { ProteinInfoPanel } from './components/ProteinInfoPanel';
export { InspectorPanel } from './components/InspectorPanel';
export { RepresentationPanel } from './components/RepresentationPanel';
export { ProteinSearchPanel, ProteinSearchProvider } from './components/ProteinSearchPanel';
export { ProteinMesh } from './components/ProteinMesh';
export { ProteinPicker } from './components/ProteinPicker';
export { ProteinHighlight } from './components/ProteinHighlight';
export { MeasurementOverlay } from './components/MeasurementOverlay';
export { ProteinViewer } from './components/ProteinViewer';

export { ProteinProvider } from './context/ProteinProvider';
export { RepresentationProvider } from './context/RepresentationProvider';
export { SelectionProvider } from './context/SelectionProvider';
export { StructureModelProvider } from './context/StructureModelProvider';
export { useProtein } from './hooks/useProtein';
export { useRepresentation } from './hooks/useRepresentation';
export { useSelection } from './hooks/useSelection';
export { useStructureModel } from './hooks/useStructureModel';
export { useProteinLoader } from './hooks/useProteinLoader';
export { useProteinSearchSelection } from './hooks/useProteinSearchSelection';

export { buildProteinGroup } from './core/buildProteinGroup';
export { buildPickIndex } from './core/buildPickIndex';
export { applyRepresentationVisibility } from './core/applyRepresentationVisibility';
export { resolvePickHit } from './core/resolvePickHit';
export { SelectionManager } from './selection/SelectionManager';
export {
  GeometryAnalysisEngine,
  geometryAnalysisEngine,
  distance as analyzeDistance,
  findNeighborAtoms,
  findNeighborResidues,
  DEFAULT_NEIGHBOR_RADIUS_ANGSTROM,
} from './analysis';
export {
  InteractionEngine,
  InteractionRegistry,
  InteractionType,
  INTERACTION_TYPE_REGISTRY,
  buildInteractionQuery,
  interactionEngine,
  defaultInteractionRegistry,
  hydrogenBondAnalyzer,
} from './analysis';
export type {
  AtomNeighborResult,
  DistanceResult,
  InteractionAnalysisOutput,
  InteractionAnalyzer,
  InteractionCandidate,
  InteractionQuery,
  InteractionResult,
  InteractionSelection,
  InteractionTypeDescriptor,
  NeighborAtomQuery,
  NeighborResidueQuery,
  ResidueNeighborResult,
  Vec3,
} from './analysis';
export {
  findAtomByName,
  getAllAtoms,
  getCaTrace,
  getNonPolymerResidues,
  getPolymerResidues,
} from './core/structureModelQueries';
export { parseStructureModel } from './parsers/parseStructureModel';
export { PdbProteinLoader } from './loaders/PdbProteinLoader';
export { ProteinLoaderRegistry, proteinLoaderRegistry } from './loaders/ProteinLoaderRegistry';
export { searchProteins } from './services/rcsbSearchService';

export type { ProteinContextValue, ProteinLoadStatus, ProteinState } from './types/protein-feature.types';
export type { ProteinSearchResult } from './types/protein-discovery.types';
export type {
  StructureAtom,
  StructureChain,
  StructureModel,
  StructureRecordGroup,
  StructureResidue,
  SecondaryStructureType,
} from './types/structure-model.types';
export type { SecondaryStructureRange } from './types/secondary-structure.types';
export type {
  ProteinRepresentationState,
  RepresentationLayerId,
} from './types/representation.types';
export type {
  AtomSelection,
  ChainSelection,
  FutureSelectionType,
  LigandSelection,
  ResidueSelection,
  SelectedObject,
  SelectionState,
  SelectionType,
} from './types/selection.types';
export { MAX_ATOM_SELECTIONS } from './types/selection.types';
export {
  DEFAULT_PROTEIN_REPRESENTATION,
  REPRESENTATION_LAYERS,
} from './types/representation.types';
export { annotateSecondaryStructure } from './parsers/annotateSecondaryStructure';
export { buildCartoonSegments } from './core/cartoonSegments';
export type { ProteinSearchState } from './hooks/useProteinSearch';
export { ProteinSearchError } from './types/protein-discovery.types';
