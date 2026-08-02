import type { ProteinStructureFormat } from '@shared/types';
import type { SecondaryStructureRange } from '../types/secondary-structure.types';
import type {
  StructureModel,
  StructureResidue,
  SecondaryStructureType,
} from '../types/structure-model.types';
import { parseMmcifSecondaryStructureRanges } from './parseMmcifSecondaryStructure';
import { parsePdbSecondaryStructureRanges } from './parsePdbSecondaryStructure';
import { parseSequenceNumber } from './structureModelUtils';

function compareResiduePosition(
  seqNumber: number,
  insertionCode: string | undefined,
  targetSeqNumber: number,
  targetInsertion: string | undefined,
): number {
  if (seqNumber !== targetSeqNumber) {
    return seqNumber - targetSeqNumber;
  }

  return (insertionCode ?? '').localeCompare(targetInsertion ?? '');
}

function isResidueInRange(
  chainId: string,
  residue: StructureResidue,
  range: SecondaryStructureRange,
): boolean {
  if (chainId !== range.chainId) {
    return false;
  }

  const startSeq = parseSequenceNumber(range.startSeqId);
  const endSeq = parseSequenceNumber(range.endSeqId);
  const minSeq = Math.min(startSeq, endSeq);
  const maxSeq = Math.max(startSeq, endSeq);

  if (residue.seqNumber < minSeq || residue.seqNumber > maxSeq) {
    return false;
  }

  if (residue.seqNumber === startSeq) {
    if (compareResiduePosition(residue.seqNumber, residue.insertionCode, startSeq, range.startInsertionCode) < 0) {
      return false;
    }
  }

  if (residue.seqNumber === endSeq) {
    if (compareResiduePosition(residue.seqNumber, residue.insertionCode, endSeq, range.endInsertionCode) > 0) {
      return false;
    }
  }

  return true;
}

function applyRangeToModel(
  model: StructureModel,
  range: SecondaryStructureRange,
  type: Exclude<SecondaryStructureType, 'coil'>,
): void {
  for (const chain of model.chains) {
    if (chain.chainId !== range.chainId) continue;

    for (const residue of chain.residues) {
      if (!residue.isPolymer) continue;
      if (isResidueInRange(chain.chainId, residue, range)) {
        residue.secondaryStructure = type;
      }
    }
  }
}

function parseSecondaryStructureRanges(
  rawData: string,
  format: ProteinStructureFormat,
): SecondaryStructureRange[] {
  try {
    return format === 'mmcif'
      ? parseMmcifSecondaryStructureRanges(rawData)
      : parsePdbSecondaryStructureRanges(rawData);
  } catch {
    return [];
  }
}

/**
 * Annotates polymer residues with helix/sheet/coil classification.
 * Unmapped residues default to coil; annotation failures are non-fatal.
 */
export function annotateSecondaryStructure(
  model: StructureModel,
  rawData: string,
): void {
  for (const chain of model.chains) {
    for (const residue of chain.residues) {
      if (residue.isPolymer) {
        residue.secondaryStructure = 'coil';
      }
    }
  }

  const ranges = parseSecondaryStructureRanges(rawData, model.format);

  for (const range of ranges) {
    if (range.type === 'helix') {
      applyRangeToModel(model, range, 'helix');
    }
  }

  for (const range of ranges) {
    if (range.type === 'sheet') {
      applyRangeToModel(model, range, 'sheet');
    }
  }
}

export function getSecondaryStructureRanges(
  rawData: string,
  format: ProteinStructureFormat,
): SecondaryStructureRange[] {
  return parseSecondaryStructureRanges(rawData, format);
}
