import * as THREE from 'three';
import type { ProteinStructureFormat } from '@shared/types';
import { parseStructureModel } from '../parsers/parseStructureModel';
import { annotateSecondaryStructure } from '../parsers/annotateSecondaryStructure';
import { ATOM_INSTANCE_MATERIAL, getSharedAtomSphereGeometry } from './atomInstancedMesh';
import { buildCartoonGroup } from './buildCartoonGroup';
import { buildLigandGroup } from './buildLigandGroup';
import { buildPolymerAtomGroup } from './buildPolymerAtomGroup';
import { centerStructureModel } from './structureBounds';
import { getAllAtoms, getCaTrace } from './structureModelQueries';

const PROTEIN_TARGET_SIZE = 5;

/**
 * Builds the hybrid protein structure group:
 * cartoon (default) + ligand CPK atoms + hidden polymer atoms.
 */
export function buildProteinGroup(
  rawData: string,
  format: ProteinStructureFormat = 'pdb',
): THREE.Group {
  const model = parseStructureModel(rawData, format);
  annotateSecondaryStructure(model, rawData);

  if (getAllAtoms(model).length === 0) {
    throw new Error('Structure contains no displayable atoms');
  }

  if (getCaTrace(model).every((trace) => trace.atoms.length < 2)) {
    throw new Error('Structure contains no polymer CA trace for cartoon rendering');
  }

  centerStructureModel(model);

  const group = new THREE.Group();
  group.name = 'protein-structure';

  const cartoonGroup = buildCartoonGroup(model);
  const ligandGroup = buildLigandGroup(model);
  const polymerAtomGroup = buildPolymerAtomGroup(model);

  group.add(cartoonGroup);
  group.add(ligandGroup);
  group.add(polymerAtomGroup);

  const sharedGeometries: THREE.BufferGeometry[] = [getSharedAtomSphereGeometry()];
  const sharedMaterials: THREE.Material[] = [ATOM_INSTANCE_MATERIAL];

  if (cartoonGroup.userData.sharedMaterials) {
    sharedMaterials.push(...(cartoonGroup.userData.sharedMaterials as THREE.Material[]));
  }

  group.userData.sharedGeometries = sharedGeometries;
  group.userData.sharedMaterials = sharedMaterials;

  centerAndScaleGroup(group, PROTEIN_TARGET_SIZE);
  return group;
}

function centerAndScaleGroup(group: THREE.Group, targetSize: number): void {
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  if (maxDim > 0) {
    const scale = targetSize / maxDim;
    group.scale.setScalar(scale);
    group.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }
}
