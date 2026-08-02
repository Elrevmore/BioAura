import type * as THREE from 'three';
import {
  REPRESENTATION_LAYER_NAMES,
  type ProteinRepresentationState,
  type RepresentationLayerId,
} from '../types/representation.types';

/**
 * Toggles visibility on existing representation child groups.
 * Does not rebuild geometry or recreate materials.
 */
export function applyRepresentationVisibility(
  root: THREE.Object3D,
  state: ProteinRepresentationState,
): void {
  for (const id of Object.keys(REPRESENTATION_LAYER_NAMES) as RepresentationLayerId[]) {
    const child = root.getObjectByName(REPRESENTATION_LAYER_NAMES[id]);
    if (child) {
      child.visible = state[id];
    }
  }
}
