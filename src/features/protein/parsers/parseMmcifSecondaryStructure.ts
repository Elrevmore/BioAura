import type { SecondaryStructureRange } from '../types/secondary-structure.types';
import {
  findLoop,
  getLoopColumnIndex,
} from './shared/mmcifAtomSite';

function readMmcifRange(
  type: SecondaryStructureRange['type'],
  tokens: string[],
  chainIdx: number,
  startSeqIdx: number,
  endSeqIdx: number,
  startInsIdx: number,
  endInsIdx: number,
): SecondaryStructureRange | null {
  const chainId = chainIdx >= 0 ? tokens[chainIdx] ?? '' : '';
  const startSeqId = startSeqIdx >= 0 ? tokens[startSeqIdx] ?? '' : '';
  const endSeqId = endSeqIdx >= 0 ? tokens[endSeqIdx] ?? '' : '';

  if (!chainId || chainId === '.' || !startSeqId || startSeqId === '.' || !endSeqId || endSeqId === '.') {
    return null;
  }

  const startInsertion =
    startInsIdx >= 0 && tokens[startInsIdx] !== '.' ? tokens[startInsIdx] : undefined;
  const endInsertion =
    endInsIdx >= 0 && tokens[endInsIdx] !== '.' ? tokens[endInsIdx] : undefined;

  return {
    type,
    chainId,
    startSeqId,
    startInsertionCode: startInsertion,
    endSeqId,
    endInsertionCode: endInsertion,
  };
}

function isHelixConfType(confType: string): boolean {
  const normalized = confType.trim().toUpperCase();
  return normalized.startsWith('HELX') || normalized.includes('HELIX');
}

/**
 * Parses mmCIF `_struct_conf` (helices) and `_struct_sheet_range` (sheets).
 */
export function parseMmcifSecondaryStructureRanges(cifText: string): SecondaryStructureRange[] {
  const ranges: SecondaryStructureRange[] = [];

  const confLoop = findLoop(cifText, (columns) =>
    columns.some((column) => column.startsWith('_struct_conf.')),
  );

  if (confLoop) {
    const typeIdx = getLoopColumnIndex(confLoop.columns, '_struct_conf.conf_type_id');
    const begChainIdx = getLoopColumnIndex(confLoop.columns, '_struct_conf.beg_label_asym_id');
    const begSeqIdx = getLoopColumnIndex(confLoop.columns, '_struct_conf.beg_label_seq_id');
    const endChainIdx = getLoopColumnIndex(confLoop.columns, '_struct_conf.end_label_asym_id');
    const endSeqIdx = getLoopColumnIndex(confLoop.columns, '_struct_conf.end_label_seq_id');
    const begInsIdx = getLoopColumnIndex(confLoop.columns, '_struct_conf.pdbx_beg_PDB_ins_code');
    const endInsIdx = getLoopColumnIndex(confLoop.columns, '_struct_conf.pdbx_end_PDB_ins_code');

    for (const tokens of confLoop.rows) {
      const confType = typeIdx >= 0 ? tokens[typeIdx] ?? '' : '';
      if (!isHelixConfType(confType)) continue;

      const begChain = begChainIdx >= 0 ? tokens[begChainIdx] ?? '' : '';
      const endChain = endChainIdx >= 0 ? tokens[endChainIdx] ?? '' : '';
      if (begChain && endChain && begChain !== endChain) continue;

      const range = readMmcifRange(
        'helix',
        tokens,
        begChainIdx,
        begSeqIdx,
        endSeqIdx,
        begInsIdx,
        endInsIdx,
      );
      if (range) ranges.push(range);
    }
  }

  const sheetLoop = findLoop(cifText, (columns) =>
    columns.some((column) => column.startsWith('_struct_sheet_range.')),
  );

  if (sheetLoop) {
    const begChainIdx = getLoopColumnIndex(sheetLoop.columns, '_struct_sheet_range.beg_label_asym_id');
    const begSeqIdx = getLoopColumnIndex(sheetLoop.columns, '_struct_sheet_range.beg_label_seq_id');
    const endChainIdx = getLoopColumnIndex(sheetLoop.columns, '_struct_sheet_range.end_label_asym_id');
    const endSeqIdx = getLoopColumnIndex(sheetLoop.columns, '_struct_sheet_range.end_label_seq_id');
    const begInsIdx = getLoopColumnIndex(
      sheetLoop.columns,
      '_struct_sheet_range.pdbx_beg_PDB_ins_code',
    );
    const endInsIdx = getLoopColumnIndex(
      sheetLoop.columns,
      '_struct_sheet_range.pdbx_end_PDB_ins_code',
    );

    for (const tokens of sheetLoop.rows) {
      const begChain = begChainIdx >= 0 ? tokens[begChainIdx] ?? '' : '';
      const endChain = endChainIdx >= 0 ? tokens[endChainIdx] ?? '' : '';
      if (begChain && endChain && begChain !== endChain) continue;

      const range = readMmcifRange(
        'sheet',
        tokens,
        begChainIdx,
        begSeqIdx,
        endSeqIdx,
        begInsIdx,
        endInsIdx,
      );
      if (range) ranges.push(range);
    }
  }

  return ranges;
}
