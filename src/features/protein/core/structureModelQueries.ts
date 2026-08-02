import type {
  StructureAtom,
  StructureChain,
  StructureModel,
  StructureResidue,
} from '../types/structure-model.types';

export function getAllAtoms(model: StructureModel): StructureAtom[] {
  const atoms: StructureAtom[] = [];

  for (const chain of model.chains) {
    for (const residue of chain.residues) {
      atoms.push(...residue.atoms);
    }
  }

  return atoms;
}

export function getPolymerResidues(model: StructureModel): StructureResidue[] {
  const residues: StructureResidue[] = [];

  for (const chain of model.chains) {
    for (const residue of chain.residues) {
      if (residue.isPolymer) {
        residues.push(residue);
      }
    }
  }

  return residues;
}

export function getNonPolymerResidues(model: StructureModel): StructureResidue[] {
  const residues: StructureResidue[] = [];

  for (const chain of model.chains) {
    for (const residue of chain.residues) {
      if (!residue.isPolymer) {
        residues.push(residue);
      }
    }
  }

  return residues;
}

const CRYSTALLOGRAPHIC_WATER_RESIDUE = 'HOH';

/** Non-polymer residues eligible for ligand CPK rendering (excludes crystallographic water). */
export function getRenderableLigandResidues(model: StructureModel): StructureResidue[] {
  return getNonPolymerResidues(model).filter(
    (residue) => residue.name.trim().toUpperCase() !== CRYSTALLOGRAPHIC_WATER_RESIDUE,
  );
}

export function findAtomByName(residue: StructureResidue, atomName: string): StructureAtom | undefined {
  const target = atomName.trim().toUpperCase();
  return residue.atoms.find((atom) => atom.name.trim().toUpperCase() === target);
}

export function getCaAtomsForChain(chain: StructureChain): StructureAtom[] {
  const caAtoms: StructureAtom[] = [];

  for (const residue of chain.residues) {
    if (!residue.isPolymer) continue;

    const ca = findAtomByName(residue, 'CA');
    if (ca) {
      caAtoms.push(ca);
    }
  }

  return caAtoms;
}

export function getCaTrace(model: StructureModel): Array<{
  chainId: string;
  atoms: StructureAtom[];
}> {
  return model.chains
    .map((chain) => ({
      chainId: chain.chainId,
      atoms: getCaAtomsForChain(chain),
    }))
    .filter((entry) => entry.atoms.length > 0);
}
