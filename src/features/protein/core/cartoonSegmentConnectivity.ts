import * as THREE from 'three';
import type { StructureAtom } from '../types/structure-model.types';
import { caAtomsToPoints } from './cartoonGeometry';

/**
 * Extends a segment's CA polyline with adjacent neighbor CAs so spline-based
 * geometry reaches into the next/previous segment without merging SSE types.
 */
export function prepareSegmentRenderPoints(
  caAtoms: StructureAtom[],
  previousBoundaryCa: StructureAtom | null,
  nextBoundaryCa: StructureAtom | null,
): THREE.Vector3[] {
  const points = caAtomsToPoints(caAtoms);

  if (previousBoundaryCa) {
    points.unshift(
      new THREE.Vector3(previousBoundaryCa.x, previousBoundaryCa.y, previousBoundaryCa.z),
    );
  }

  if (nextBoundaryCa) {
    points.push(new THREE.Vector3(nextBoundaryCa.x, nextBoundaryCa.y, nextBoundaryCa.z));
  }

  return points;
}
