import * as THREE from 'three';
import type { StructureModel } from '../types/structure-model.types';
import {
  ATOM_INSTANCE_MATERIAL,
  createInstancedAtomMesh,
  getSharedAtomSphereGeometry,
} from './atomInstancedMesh';
import { collectAtomsFromResidues } from './structureBounds';
import { getRenderableLigandResidues } from './structureModelQueries';

/**
 * CPK instanced atoms for HETATM / non-polymer components.
 * Crystallographic water (HOH) is excluded from rendering.
 * Bond geometry is omitted — the normalized model does not include connectivity.
 */
export function buildLigandGroup(model: StructureModel): THREE.Group {
  const ligandGroup = new THREE.Group();
  ligandGroup.name = 'ligands';

  const ligandAtoms = collectAtomsFromResidues(getRenderableLigandResidues(model));
  const atomMesh = createInstancedAtomMesh(ligandAtoms, 'atoms');

  if (atomMesh) {
    ligandGroup.add(atomMesh);
    ligandGroup.userData.sharedGeometries = [getSharedAtomSphereGeometry()];
    ligandGroup.userData.sharedMaterials = [ATOM_INSTANCE_MATERIAL];
  }

  return ligandGroup;
}
