import type {
  StructureAtom,
  StructureResidue,
} from '../types/structure-model.types';

/** 3D coordinate in Ångström (structure-local space). */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface DistanceResult {
  distanceAngstrom: number;
  distanceNanometer: number;
  distanceSquared: number;
  distanceVector: Vec3;
  midpoint: Vec3;
}

export interface AtomNeighborResult {
  distance: number;
  atom: StructureAtom;
  residue: StructureResidue;
  chainId: string;
}

export interface ResidueNeighborResult {
  distance: number;
  residue: StructureResidue;
  chainId: string;
}

export interface NeighborAtomQuery {
  atom?: StructureAtom;
  residue?: StructureResidue;
  chainId?: string;
  radiusAngstrom?: number;
}

export interface NeighborResidueQuery {
  residue: StructureResidue;
  chainId: string;
  radiusAngstrom?: number;
}

/** Default neighbor search radius (Å). */
export const DEFAULT_NEIGHBOR_RADIUS_ANGSTROM = 5;
