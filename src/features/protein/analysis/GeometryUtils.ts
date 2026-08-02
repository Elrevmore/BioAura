import type { StructureAtom, StructureResidue } from '../types/structure-model.types';
import { findAtomByName } from '../core/structureModelQueries';
import type { Vec3 } from './geometry.types';

/** Ångström → nanometer conversion factor. */
export const ANGSTROM_TO_NANOMETER = 0.1;

export function vec3FromAtom(atom: StructureAtom): Vec3 {
  return { x: atom.x, y: atom.y, z: atom.z };
}

export function subtract(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function scale(v: Vec3, scalar: number): Vec3 {
  return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
}

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return scale(add(a, b), 0.5);
}

export function distanceSquared(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function distance(a: Vec3, b: Vec3): number {
  return Math.sqrt(distanceSquared(a, b));
}

/**
 * Residue reference point for neighbor queries — CA when present, otherwise centroid.
 */
export function residueReferencePoint(residue: StructureResidue): Vec3 {
  const ca = findAtomByName(residue, 'CA');
  if (ca) {
    return vec3FromAtom(ca);
  }

  if (residue.atoms.length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  let x = 0;
  let y = 0;
  let z = 0;
  for (const atom of residue.atoms) {
    x += atom.x;
    y += atom.y;
    z += atom.z;
  }
  const count = residue.atoms.length;
  return { x: x / count, y: y / count, z: z / count };
}
