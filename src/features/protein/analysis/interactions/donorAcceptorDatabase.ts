/**
 * Data-driven donor/acceptor definitions for hydrogen-bond preparation.
 * Lookup functions compose these tables — no hardcoded per-residue if/else chains.
 */

export interface DonorAcceptorRole {
  donors: readonly string[];
  acceptors: readonly string[];
}

/** Backbone and side-chain atom names commonly acting as H-bond donors. */
export const COMMON_DONOR_ATOM_NAMES: readonly string[] = [
  'N',
  'NE',
  'NE1',
  'NE2',
  'NH1',
  'NH2',
  'ND1',
  'ND2',
  'NZ',
  'OG',
  'OG1',
  'OH',
] as const;

/** Backbone and side-chain atom names commonly acting as H-bond acceptors. */
export const COMMON_ACCEPTOR_ATOM_NAMES: readonly string[] = [
  'O',
  'OD1',
  'OD2',
  'OE1',
  'OE2',
  'OG',
  'OG1',
  'OH',
  'ND1',
  'NE2',
  'NE1',
] as const;

/**
 * Standard amino-acid donor/acceptor atom names (normalized, no altLoc digits).
 * Empty arrays mean the residue relies on backbone N/O only via common tables.
 */
export const AMINO_ACID_DONOR_ACCEPTOR: Readonly<Record<string, DonorAcceptorRole>> = {
  ALA: { donors: [], acceptors: [] },
  ARG: { donors: ['NE', 'NH1', 'NH2'], acceptors: [] },
  ASN: { donors: ['ND2'], acceptors: ['OD1'] },
  ASP: { donors: [], acceptors: ['OD1', 'OD2'] },
  CYS: { donors: ['SG'], acceptors: ['SG'] },
  GLN: { donors: ['NE2'], acceptors: ['OE1'] },
  GLU: { donors: [], acceptors: ['OE1', 'OE2'] },
  GLY: { donors: [], acceptors: [] },
  HIS: { donors: ['ND1', 'NE2'], acceptors: ['ND1', 'NE2'] },
  ILE: { donors: [], acceptors: [] },
  LEU: { donors: [], acceptors: [] },
  LYS: { donors: ['NZ'], acceptors: [] },
  MET: { donors: [], acceptors: [] },
  PHE: { donors: [], acceptors: [] },
  PRO: { donors: [], acceptors: [] },
  SER: { donors: ['OG'], acceptors: ['OG'] },
  THR: { donors: ['OG1'], acceptors: ['OG1'] },
  TRP: { donors: ['NE1'], acceptors: ['NE1'] },
  TYR: { donors: ['OH'], acceptors: ['OH'] },
  VAL: { donors: [], acceptors: [] },
} as const;

export const WATER_HANDLING_RULES = {
  residueNames: ['HOH', 'WAT', 'H2O', 'DOD'] as const,
  excludeFromDonorAcceptorAnalysis: true,
  allowAsBridge: false,
} as const;

export const LIGAND_COMPATIBILITY_RULES = {
  includeHetatmResidues: true,
  useCommonDonorAcceptorNames: true,
  fallbackToElementHeuristic: true,
} as const;

const commonDonorSet = new Set(COMMON_DONOR_ATOM_NAMES);
const commonAcceptorSet = new Set(COMMON_ACCEPTOR_ATOM_NAMES);
const waterResidueSet = new Set(
  WATER_HANDLING_RULES.residueNames.map((name) => name.toUpperCase()),
);

export function normalizeAtomName(atomName: string): string {
  return atomName.trim().toUpperCase();
}

export function normalizeResidueName(residueName: string): string {
  return residueName.trim().toUpperCase();
}

export function isCrystallographicWater(residueName: string): boolean {
  return waterResidueSet.has(normalizeResidueName(residueName));
}

export function lookupDonorAcceptorRole(
  residueName: string,
): DonorAcceptorRole | undefined {
  return AMINO_ACID_DONOR_ACCEPTOR[normalizeResidueName(residueName)];
}

export function isCommonDonorAtom(atomName: string): boolean {
  return commonDonorSet.has(normalizeAtomName(atomName));
}

export function isCommonAcceptorAtom(atomName: string): boolean {
  return commonAcceptorSet.has(normalizeAtomName(atomName));
}

export function isDonorAtom(atomName: string, residueName: string): boolean {
  if (
    WATER_HANDLING_RULES.excludeFromDonorAcceptorAnalysis &&
    isCrystallographicWater(residueName)
  ) {
    return false;
  }

  const normalizedAtom = normalizeAtomName(atomName);
  if (LIGAND_COMPATIBILITY_RULES.useCommonDonorAcceptorNames && commonDonorSet.has(normalizedAtom)) {
    return true;
  }

  const role = lookupDonorAcceptorRole(residueName);
  return role?.donors.includes(normalizedAtom) ?? false;
}

export function isAcceptorAtom(atomName: string, residueName: string): boolean {
  if (
    WATER_HANDLING_RULES.excludeFromDonorAcceptorAnalysis &&
    isCrystallographicWater(residueName)
  ) {
    return false;
  }

  const normalizedAtom = normalizeAtomName(atomName);
  if (
    LIGAND_COMPATIBILITY_RULES.useCommonDonorAcceptorNames &&
    commonAcceptorSet.has(normalizedAtom)
  ) {
    return true;
  }

  const role = lookupDonorAcceptorRole(residueName);
  return role?.acceptors.includes(normalizedAtom) ?? false;
}

export function isLigandCompatibleResidue(isPolymer: boolean): boolean {
  if (isPolymer) {
    return true;
  }
  return LIGAND_COMPATIBILITY_RULES.includeHetatmResidues;
}
