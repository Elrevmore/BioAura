import * as THREE from 'three';
import type { StructureAtom, StructureModel } from '../types/structure-model.types';
import { getAllAtoms } from './structureModelQueries';

/** Centers all atom coordinates in-place around the structure centroid. */
export function centerStructureModel(model: StructureModel): void {
  const atoms = getAllAtoms(model);
  if (atoms.length === 0) {
    return;
  }

  const box = new THREE.Box3();
  for (const atom of atoms) {
    box.expandByPoint(new THREE.Vector3(atom.x, atom.y, atom.z));
  }

  const center = box.getCenter(new THREE.Vector3());
  for (const atom of atoms) {
    atom.x -= center.x;
    atom.y -= center.y;
    atom.z -= center.z;
  }
}

export function collectAtomsFromResidues(
  residues: Array<{ atoms: StructureAtom[] }>,
): StructureAtom[] {
  const atoms: StructureAtom[] = [];
  for (const residue of residues) {
    atoms.push(...residue.atoms);
  }
  return atoms;
}
