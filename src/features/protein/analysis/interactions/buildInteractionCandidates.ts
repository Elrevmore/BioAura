import type { GeometryAnalysisEngine } from '../GeometryAnalysisEngine';
import type { AtomNeighborResult } from '../geometry.types';
import type { StructureAtom, StructureResidue } from '../../types/structure-model.types';
import type { InteractionCandidate } from './InteractionCandidate';

export interface SourceAtomRef {
  atom: StructureAtom;
  residue: StructureResidue;
  chainId: string;
}

/**
 * Builds atom-pair candidates from a single neighbor search result.
 * Distances are computed via GeometryAnalysisEngine (O(1) per pair).
 */
export function buildInteractionCandidates(
  sources: SourceAtomRef[],
  neighbors: AtomNeighborResult[],
  geometry: GeometryAnalysisEngine,
): InteractionCandidate[] {
  const candidates: InteractionCandidate[] = [];

  for (const source of sources) {
    for (const neighbor of neighbors) {
      if (neighbor.atom === source.atom) {
        continue;
      }

      const distance = geometry.distance(source.atom, neighbor.atom);
      candidates.push({
        sourceAtom: source.atom,
        targetAtom: neighbor.atom,
        sourceResidue: source.residue,
        targetResidue: neighbor.residue,
        sourceChainId: source.chainId,
        targetChainId: neighbor.chainId,
        distanceAngstrom: distance.distanceAngstrom,
      });
    }
  }

  return candidates;
}

export function resolveSourceAtoms(
  selection: import('./InteractionQuery').InteractionSelection,
): SourceAtomRef[] {
  switch (selection.kind) {
    case 'atom':
      return [
        {
          atom: selection.atom,
          residue: selection.residue,
          chainId: selection.chainId,
        },
      ];
    case 'residue':
    case 'ligand':
      return selection.residue.atoms.map((atom) => ({
        atom,
        residue: selection.residue,
        chainId: selection.chainId,
      }));
    default:
      return [];
  }
}
