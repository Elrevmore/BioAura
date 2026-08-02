import type { StructureAtom, StructureModel } from '../types/structure-model.types';
import { distance as distanceBetweenAtoms } from './DistanceAnalyzer';
import { findNeighborAtoms, findNeighborResidues } from './NeighborAnalyzer';
import type {
  AtomNeighborResult,
  DistanceResult,
  NeighborAtomQuery,
  NeighborResidueQuery,
  ResidueNeighborResult,
} from './geometry.types';

/**
 * Facade for pure geometry analysis on StructureModel data.
 * Future analyzers (H-bonds, salt bridges, pockets) plug into this engine.
 */
export class GeometryAnalysisEngine {
  distance(atomA: StructureAtom, atomB: StructureAtom): DistanceResult {
    return distanceBetweenAtoms(atomA, atomB);
  }

  findNeighborAtoms(
    model: StructureModel,
    query: NeighborAtomQuery,
  ): AtomNeighborResult[] {
    return findNeighborAtoms(model, query);
  }

  findNeighborResidues(
    model: StructureModel,
    query: NeighborResidueQuery,
  ): ResidueNeighborResult[] {
    return findNeighborResidues(model, query);
  }
}

/** Shared stateless engine instance for UI and future tools. */
export const geometryAnalysisEngine = new GeometryAnalysisEngine();
