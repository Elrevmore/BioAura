import type { StructureAtom, StructureModel, SecondaryStructureType } from '../types/structure-model.types';
import { findAtomByName } from './structureModelQueries';

export interface CartoonSegment {
  chainId: string;
  type: SecondaryStructureType;
  caAtoms: StructureAtom[];
  segmentIndex: number;
}

const MIN_SEGMENT_POINTS_BY_TYPE = {
  coil: 2,
  helix: 1,
  sheet: 1,
} as const;

function minSegmentPoints(type: SecondaryStructureType): number {
  return MIN_SEGMENT_POINTS_BY_TYPE[type];
}

/**
 * Groups contiguous polymer CA residues by secondary-structure type per chain.
 */
export function buildCartoonSegments(model: StructureModel): CartoonSegment[] {
  const segments: CartoonSegment[] = [];

  for (const chain of model.chains) {
    let currentType: SecondaryStructureType | null = null;
    let currentAtoms: StructureAtom[] = [];
    let segmentIndex = 0;

    const flush = () => {
      if (currentType && currentAtoms.length >= minSegmentPoints(currentType)) {
        segments.push({
          chainId: chain.chainId,
          type: currentType,
          caAtoms: currentAtoms,
          segmentIndex,
        });
        segmentIndex += 1;
      }
      currentType = null;
      currentAtoms = [];
    };

    for (const residue of chain.residues) {
      if (!residue.isPolymer) continue;

      const ca = findAtomByName(residue, 'CA');
      if (!ca) continue;

      const residueType = residue.secondaryStructure ?? 'coil';
      if (currentType === null) {
        currentType = residueType;
        currentAtoms = [ca];
        continue;
      }

      if (residueType === currentType) {
        currentAtoms.push(ca);
      } else {
        flush();
        currentType = residueType;
        currentAtoms = [ca];
      }
    }

    flush();
  }

  return segments;
}
