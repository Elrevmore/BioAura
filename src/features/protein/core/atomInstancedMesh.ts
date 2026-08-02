import * as THREE from 'three';
import type { StructureAtom } from '../types/structure-model.types';
import { cpkColorForElement } from './cpkColors';

export const ATOM_SPHERE_RADIUS = 1.2;

export const ATOM_INSTANCE_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0x0a1628,
  emissiveIntensity: 0.15,
  metalness: 0.3,
  roughness: 0.4,
});

let sharedAtomSphereGeometry: THREE.IcosahedronGeometry | null = null;

export function getSharedAtomSphereGeometry(): THREE.IcosahedronGeometry {
  if (!sharedAtomSphereGeometry) {
    sharedAtomSphereGeometry = new THREE.IcosahedronGeometry(ATOM_SPHERE_RADIUS, 1);
  }
  return sharedAtomSphereGeometry;
}

export function createInstancedAtomMesh(
  atoms: StructureAtom[],
  meshName: string,
): THREE.InstancedMesh | null {
  if (atoms.length === 0) {
    return null;
  }

  const sphereGeometry = getSharedAtomSphereGeometry();
  const mesh = new THREE.InstancedMesh(
    sphereGeometry,
    ATOM_INSTANCE_MATERIAL,
    atoms.length,
  );

  mesh.name = meshName;
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const instanceColor = new THREE.Color();
  const fallbackColor = cpkColorForElement('');

  for (let i = 0; i < atoms.length; i++) {
    const atom = atoms[i];
    position.set(atom.x, atom.y, atom.z);
    matrix.makeTranslation(position.x, position.y, position.z);
    mesh.setMatrixAt(i, matrix);

    instanceColor.copy(atom.element ? cpkColorForElement(atom.element) : fallbackColor);
    mesh.setColorAt(i, instanceColor);
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
  mesh.computeBoundingSphere();
  mesh.computeBoundingBox();
  return mesh;
}
