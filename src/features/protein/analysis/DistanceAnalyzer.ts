import type { StructureAtom } from '../types/structure-model.types';
import type { DistanceResult } from './geometry.types';
import {
  ANGSTROM_TO_NANOMETER,
  distanceSquared,
  midpoint,
  subtract,
  vec3FromAtom,
} from './GeometryUtils';

/**
 * Pure distance analysis between two structure atoms.
 */
export function distance(atomA: StructureAtom, atomB: StructureAtom): DistanceResult {
  const a = vec3FromAtom(atomA);
  const b = vec3FromAtom(atomB);
  const distSq = distanceSquared(a, b);
  const dist = Math.sqrt(distSq);

  return {
    distanceAngstrom: dist,
    distanceNanometer: dist * ANGSTROM_TO_NANOMETER,
    distanceSquared: distSq,
    distanceVector: subtract(b, a),
    midpoint: midpoint(a, b),
  };
}
