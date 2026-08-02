import * as THREE from 'three';
import type { StructureModel } from '../types/structure-model.types';
import {
  ATOM_INSTANCE_MATERIAL,
  createInstancedAtomMesh,
  getSharedAtomSphereGeometry,
} from './atomInstancedMesh';
import { collectAtomsFromResidues } from './structureBounds';
import { getPolymerResidues } from './structureModelQueries';

/**
 * Preserved polymer ball-and-stick atoms (hidden by default for future inspection mode).
 */
export function buildPolymerAtomGroup(model: StructureModel): THREE.Group {
  const polymerGroup = new THREE.Group();
  polymerGroup.name = 'polymer-atoms';
  polymerGroup.visible = false;

  const polymerAtoms = collectAtomsFromResidues(getPolymerResidues(model));
  const atomMesh = createInstancedAtomMesh(polymerAtoms, 'atoms');

  if (atomMesh) {
    polymerGroup.add(atomMesh);
    polymerGroup.userData.sharedGeometries = [getSharedAtomSphereGeometry()];
    polymerGroup.userData.sharedMaterials = [ATOM_INSTANCE_MATERIAL];
  }

  return polymerGroup;
}
