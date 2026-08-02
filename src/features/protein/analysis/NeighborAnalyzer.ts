import type { StructureModel } from '../types/structure-model.types';
import type {
  AtomNeighborResult,
  NeighborAtomQuery,
  NeighborResidueQuery,
  ResidueNeighborResult,
  Vec3,
} from './geometry.types';
import { DEFAULT_NEIGHBOR_RADIUS_ANGSTROM } from './geometry.types';
import {
  distance,
  distanceSquared,
  residueReferencePoint,
  vec3FromAtom,
} from './GeometryUtils';

function resolveAtomQueryOrigin(query: NeighborAtomQuery): Vec3 | null {
  if (query.atom) {
    return vec3FromAtom(query.atom);
  }
  if (query.residue) {
    return residueReferencePoint(query.residue);
  }
  return null;
}

/**
 * Finds atoms within a radius of a query atom or residue reference point.
 * Results are sorted by ascending distance.
 */
export function findNeighborAtoms(
  model: StructureModel,
  query: NeighborAtomQuery,
): AtomNeighborResult[] {
  const origin = resolveAtomQueryOrigin(query);
  if (!origin) {
    return [];
  }

  const radius = query.radiusAngstrom ?? DEFAULT_NEIGHBOR_RADIUS_ANGSTROM;
  const radiusSq = radius * radius;
  const results: AtomNeighborResult[] = [];

  for (const chain of model.chains) {
    for (const residue of chain.residues) {
      for (const atom of residue.atoms) {
        if (query.atom && atom === query.atom) {
          continue;
        }
        if (query.residue && residue === query.residue) {
          continue;
        }

        const distSq = distanceSquared(origin, vec3FromAtom(atom));
        if (distSq > radiusSq) {
          continue;
        }

        results.push({
          distance: Math.sqrt(distSq),
          atom,
          residue,
          chainId: chain.chainId,
        });
      }
    }
  }

  results.sort((left, right) => left.distance - right.distance);
  return results;
}

/**
 * Finds residues whose reference points lie within a radius of the query residue.
 * Results are sorted by ascending centroid distance.
 */
export function findNeighborResidues(
  model: StructureModel,
  query: NeighborResidueQuery,
): ResidueNeighborResult[] {
  const origin = residueReferencePoint(query.residue);
  const radius = query.radiusAngstrom ?? DEFAULT_NEIGHBOR_RADIUS_ANGSTROM;
  const results: ResidueNeighborResult[] = [];

  for (const chain of model.chains) {
    for (const residue of chain.residues) {
      if (residue === query.residue && chain.chainId === query.chainId) {
        continue;
      }

      const target = residueReferencePoint(residue);
      const dist = distance(origin, target);
      if (dist > radius) {
        continue;
      }

      results.push({
        distance: dist,
        residue,
        chainId: chain.chainId,
      });
    }
  }

  results.sort((left, right) => left.distance - right.distance);
  return results;
}
