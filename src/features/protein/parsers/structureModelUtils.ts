import type {
  StructureAtom,
  StructureChain,
  StructureModel,
  StructureRecordGroup,
  StructureResidue,
} from '../types/structure-model.types';
import { isStandardAminoAcidResidue } from './shared/polymerResidues';

export interface MutableResidue extends StructureResidue {
  atoms: StructureAtom[];
}

export function isPolymerRecord(
  recordGroup: StructureRecordGroup,
  residueName: string,
): boolean {
  return recordGroup === 'ATOM' && isStandardAminoAcidResidue(residueName);
}

export function residueKey(
  chainId: string,
  seqId: string,
  insertionCode: string,
  residueName: string,
): string {
  return `${chainId}|${seqId}|${insertionCode}|${residueName}`;
}

export function parseSequenceNumber(seqId: string): number {
  const parsed = Number.parseInt(seqId, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function finalizeStructureModel(
  format: StructureModel['format'],
  chainMap: Map<string, Map<string, MutableResidue>>,
): StructureModel {
  const chains: StructureChain[] = [...chainMap.entries()]
    .sort(([chainA], [chainB]) => chainA.localeCompare(chainB))
    .map(([chainId, residueMap]) => ({
      chainId,
      residues: [...residueMap.values()].sort(compareResidues),
    }));

  return { format, chains };
}

function compareResidues(a: StructureResidue, b: StructureResidue): number {
  if (a.seqNumber !== b.seqNumber) {
    return a.seqNumber - b.seqNumber;
  }

  const insertionCompare = (a.insertionCode ?? '').localeCompare(b.insertionCode ?? '');
  if (insertionCompare !== 0) {
    return insertionCompare;
  }

  return a.name.localeCompare(b.name);
}

export function addAtomToModel(
  chainMap: Map<string, Map<string, MutableResidue>>,
  chainId: string,
  residueName: string,
  seqId: string,
  insertionCode: string,
  recordGroup: StructureRecordGroup,
  atom: Omit<StructureAtom, 'recordGroup' | 'isPolymer'>,
): void {
  const normalizedChainId = chainId.trim() || '_';
  const normalizedResidueName = residueName.trim().toUpperCase();
  const normalizedInsertion = insertionCode.trim();
  const polymer = isPolymerRecord(recordGroup, normalizedResidueName);
  const key = residueKey(normalizedChainId, seqId, normalizedInsertion, normalizedResidueName);

  if (!chainMap.has(normalizedChainId)) {
    chainMap.set(normalizedChainId, new Map());
  }

  const residueMap = chainMap.get(normalizedChainId)!;
  let residue = residueMap.get(key);

  if (!residue) {
    residue = {
      name: normalizedResidueName,
      seqId,
      seqNumber: parseSequenceNumber(seqId),
      insertionCode: normalizedInsertion || undefined,
      recordGroup,
      isPolymer: polymer,
      atoms: [],
    };
    residueMap.set(key, residue);
  }

  residue.atoms.push({
    ...atom,
    recordGroup,
    isPolymer: polymer,
  });
}
