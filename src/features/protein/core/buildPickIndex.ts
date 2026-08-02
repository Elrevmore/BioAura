import type {
  StructureAtom,
  StructureChain,
  StructureModel,
  StructureResidue,
} from '../types/structure-model.types';
import { buildCartoonSegments, type CartoonSegment } from './cartoonSegments';
import { collectAtomsFromResidues } from './structureBounds';
import { getPolymerResidues, getRenderableLigandResidues } from './structureModelQueries';

export interface AtomInstanceRef {
  chainId: string;
  residue: StructureResidue;
  atom: StructureAtom;
}

export interface CartoonPickEntry {
  chainId: string;
  segment: CartoonSegment;
  caResiduePairs: Array<{ ca: StructureAtom; residue: StructureResidue }>;
}

export interface PickIndex {
  /** Flat instance list for ligands/atoms InstancedMesh — index = instanceId. */
  ligandInstances: AtomInstanceRef[];
  /** Flat instance list for polymer-atoms/atoms InstancedMesh — index = instanceId. */
  polymerInstances: AtomInstanceRef[];
  cartoonByMeshName: Map<string, CartoonPickEntry>;
  chainById: Map<string, StructureChain>;
}

const CRYSTALLOGRAPHIC_WATER = 'HOH';

function buildChainMap(model: StructureModel): Map<string, StructureChain> {
  const map = new Map<string, StructureChain>();
  for (const chain of model.chains) {
    map.set(chain.chainId, chain);
  }
  return map;
}

function buildLigandInstances(model: StructureModel): AtomInstanceRef[] {
  const instances: AtomInstanceRef[] = [];

  for (const chain of model.chains) {
    for (const residue of chain.residues) {
      if (residue.isPolymer) continue;
      if (residue.name.trim().toUpperCase() === CRYSTALLOGRAPHIC_WATER) continue;

      for (const atom of residue.atoms) {
        instances.push({ chainId: chain.chainId, residue, atom });
      }
    }
  }

  return instances;
}

function buildPolymerInstances(model: StructureModel): AtomInstanceRef[] {
  const instances: AtomInstanceRef[] = [];

  for (const chain of model.chains) {
    for (const residue of chain.residues) {
      if (!residue.isPolymer) continue;

      for (const atom of residue.atoms) {
        instances.push({ chainId: chain.chainId, residue, atom });
      }
    }
  }

  return instances;
}

function findResidueContainingAtom(
  chain: StructureChain,
  atom: StructureAtom,
): StructureResidue | undefined {
  for (const residue of chain.residues) {
    if (residue.atoms.includes(atom)) {
      return residue;
    }
  }
  return undefined;
}

function buildCartoonPickMap(
  model: StructureModel,
  chainById: Map<string, StructureChain>,
): Map<string, CartoonPickEntry> {
  const map = new Map<string, CartoonPickEntry>();
  const segments = buildCartoonSegments(model);

  for (const segment of segments) {
    const chain = chainById.get(segment.chainId);
    if (!chain) continue;

    const caResiduePairs: CartoonPickEntry['caResiduePairs'] = [];
    for (const ca of segment.caAtoms) {
      const residue = findResidueContainingAtom(chain, ca);
      if (residue) {
        caResiduePairs.push({ ca, residue });
      }
    }

    const meshName = `chain-${segment.chainId}-${segment.type}-${segment.segmentIndex}`;
    map.set(meshName, { chainId: segment.chainId, segment, caResiduePairs });
  }

  return map;
}

/**
 * Builds O(1) lookup tables that mirror instanced-atom and cartoon mesh ordering.
 */
export function buildPickIndex(model: StructureModel): PickIndex {
  const chainById = buildChainMap(model);

  const ligandInstances = buildLigandInstances(model);
  const polymerInstances = buildPolymerInstances(model);

  // Sanity: flat atom order must match buildLigandGroup / buildPolymerAtomGroup.
  const ligandAtomCount = collectAtomsFromResidues(getRenderableLigandResidues(model)).length;
  const polymerAtomCount = collectAtomsFromResidues(getPolymerResidues(model)).length;

  if (ligandInstances.length !== ligandAtomCount) {
    throw new Error('Ligand pick index length does not match rendered atom count');
  }
  if (polymerInstances.length !== polymerAtomCount) {
    throw new Error('Polymer pick index length does not match rendered atom count');
  }

  return {
    ligandInstances,
    polymerInstances,
    cartoonByMeshName: buildCartoonPickMap(model, chainById),
    chainById,
  };
}
