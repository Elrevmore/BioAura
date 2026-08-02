import type { SecondaryStructureRange } from '../types/secondary-structure.types';

interface PdbRecordSliceLayout {
  startChain: number;
  startSeq: readonly [number, number];
  startInsertion: number;
  endChain: number;
  endSeq: readonly [number, number];
  endInsertion: number;
}

/**
 * wwPDB v3.3 fixed-width columns (0-based slice indices).
 * Matches compact HELIX/SHEET lines used in unit-test fixtures.
 */
const WW_PDB_HELIX_LAYOUT: PdbRecordSliceLayout = {
  startChain: 13,
  startSeq: [14, 18],
  startInsertion: 18,
  endChain: 22,
  endSeq: [23, 27],
  endInsertion: 27,
};

const WW_PDB_SHEET_LAYOUT: PdbRecordSliceLayout = {
  startChain: 16,
  startSeq: [17, 21],
  startInsertion: 21,
  endChain: 26,
  endSeq: [27, 31],
  endInsertion: 31,
};

/**
 * RCSB PDB files include helix/sheet identifiers before residue fields,
 * shifting auth chain and sequence columns right relative to wwPDB v3.3.
 */
const RCSB_HELIX_LAYOUT: PdbRecordSliceLayout = {
  startChain: 19,
  startSeq: [21, 25],
  startInsertion: 25,
  endChain: 31,
  endSeq: [33, 37],
  endInsertion: 37,
};

const RCSB_SHEET_LAYOUT: PdbRecordSliceLayout = {
  startChain: 21,
  startSeq: [22, 26],
  startInsertion: 26,
  endChain: 32,
  endSeq: [33, 37],
  endInsertion: 37,
};

function trimField(value: string): string {
  return value.trim();
}

function isValidChainId(chainId: string): boolean {
  const normalized = chainId.trim();
  return normalized.length === 1 && /^[A-Za-z0-9]$/.test(normalized);
}

function isValidSeqId(seqId: string): boolean {
  return /^-?\d+$/.test(trimField(seqId));
}

function readRange(
  type: SecondaryStructureRange['type'],
  chainId: string,
  startSeqId: string,
  startInsertionCode: string,
  endSeqId: string,
  endInsertionCode: string,
): SecondaryStructureRange | null {
  const normalizedChain = trimField(chainId);
  const start = trimField(startSeqId);
  const end = trimField(endSeqId);

  if (
    !isValidChainId(normalizedChain) ||
    !isValidSeqId(start) ||
    !isValidSeqId(end)
  ) {
    return null;
  }

  return {
    type,
    chainId: normalizedChain,
    startSeqId: start,
    startInsertionCode: startInsertionCode.trim() || undefined,
    endSeqId: end,
    endInsertionCode: endInsertionCode.trim() || undefined,
  };
}

function readRangeFromLayout(
  line: string,
  layout: PdbRecordSliceLayout,
  type: SecondaryStructureRange['type'],
): SecondaryStructureRange | null {
  const startChain = trimField(line[layout.startChain] ?? '');
  const endChain = trimField(line[layout.endChain] ?? '');

  if (startChain && endChain && startChain !== endChain) {
    return null;
  }

  const chainId = startChain || endChain;

  return readRange(
    type,
    chainId,
    line.slice(...layout.startSeq),
    line[layout.startInsertion] ?? '',
    line.slice(...layout.endSeq),
    line[layout.endInsertion] ?? '',
  );
}

function parseHelixLine(line: string): SecondaryStructureRange | null {
  for (const layout of [RCSB_HELIX_LAYOUT, WW_PDB_HELIX_LAYOUT]) {
    const range = readRangeFromLayout(line, layout, 'helix');
    if (range) return range;
  }

  return null;
}

function parseSheetLine(line: string): SecondaryStructureRange | null {
  for (const layout of [RCSB_SHEET_LAYOUT, WW_PDB_SHEET_LAYOUT]) {
    const range = readRangeFromLayout(line, layout, 'sheet');
    if (range) return range;
  }

  return null;
}

/**
 * Parses PDB HELIX and SHEET records into normalized secondary-structure ranges.
 *
 * Tries RCSB column layout first, then wwPDB v3.3, validating chain IDs and
 * numeric sequence numbers so misaligned slices are rejected.
 */
export function parsePdbSecondaryStructureRanges(pdbText: string): SecondaryStructureRange[] {
  const ranges: SecondaryStructureRange[] = [];

  for (const line of pdbText.split('\n')) {
    if (line.startsWith('HELIX ')) {
      const range = parseHelixLine(line);
      if (range) ranges.push(range);
      continue;
    }

    if (line.startsWith('SHEET ')) {
      const range = parseSheetLine(line);
      if (range) ranges.push(range);
    }
  }

  return ranges;
}
