import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildCartoonSegments } from '../core/cartoonSegments';
import { annotateSecondaryStructure } from './annotateSecondaryStructure';
import { parseStructureModel } from './parseStructureModel';
import {
  CRAMBIN_RCSB_SSE_SNIPPET,
  HEMOGLOBIN_RCSB_SSE_SNIPPET,
  MULTI_CHAIN_PDB_SNIPPET,
  SSE_MMCIF_SNIPPET,
  SSE_PDB_SNIPPET,
  TPC_RCSB_SSE_SNIPPET,
  UBIQUITIN_RCSB_SSE_SNIPPET,
} from './parseStructureModel.fixtures';
import { parseMmcifSecondaryStructureRanges } from './parseMmcifSecondaryStructure';
import { parsePdbSecondaryStructureRanges } from './parsePdbSecondaryStructure';

describe('secondary structure parsing', () => {
  it('parses PDB HELIX and SHEET ranges with chain IDs', () => {
    const ranges = parsePdbSecondaryStructureRanges(SSE_PDB_SNIPPET);

    assert.ok(ranges.some((range) => range.type === 'helix' && range.chainId === 'A'));
    assert.ok(ranges.some((range) => range.type === 'sheet' && range.chainId === 'B'));
  });

  it('parses RCSB-style 1UBQ HELIX and SHEET records with correct auth columns', () => {
    const ranges = parsePdbSecondaryStructureRanges(UBIQUITIN_RCSB_SSE_SNIPPET);

    assert.deepEqual(
      ranges.filter((range) => range.type === 'helix').map(({ type, chainId, startSeqId, endSeqId }) => ({
        type,
        chainId,
        startSeqId,
        endSeqId,
      })),
      [
        {
          type: 'helix',
          chainId: 'A',
          startSeqId: '23',
          endSeqId: '34',
        },
        {
          type: 'helix',
          chainId: 'A',
          startSeqId: '56',
          endSeqId: '59',
        },
      ],
    );

    const sheetRange = ranges.find((range) => range.type === 'sheet');
    assert.ok(sheetRange);
    assert.equal(sheetRange.chainId, 'A');
    assert.equal(sheetRange.startSeqId, '10');
    assert.equal(sheetRange.endSeqId, '17');
  });

  it('parses RCSB-style 1CRN HELIX and SHEET records', () => {
    const ranges = parsePdbSecondaryStructureRanges(CRAMBIN_RCSB_SSE_SNIPPET);

    assert.ok(
      ranges.some(
        (range) =>
          range.type === 'helix' &&
          range.chainId === 'A' &&
          range.startSeqId === '7' &&
          range.endSeqId === '19',
      ),
    );
    assert.ok(
      ranges.some(
        (range) =>
          range.type === 'sheet' &&
          range.chainId === 'A' &&
          range.startSeqId === '2' &&
          range.endSeqId === '4',
      ),
    );
  });

  it('parses RCSB-style 1TPC HELIX records with numeric chain IDs', () => {
    const ranges = parsePdbSecondaryStructureRanges(TPC_RCSB_SSE_SNIPPET);

    assert.ok(
      ranges.some(
        (range) =>
          range.type === 'helix' &&
          range.chainId === '1' &&
          range.startSeqId === '18' &&
          range.endSeqId === '30',
      ),
    );
    assert.ok(
      ranges.some(
        (range) =>
          range.type === 'helix' &&
          range.chainId === '1' &&
          range.startSeqId === '40' &&
          range.endSeqId === '52',
      ),
    );
  });

  it('parses RCSB-style 1HHO HELIX records', () => {
    const ranges = parsePdbSecondaryStructureRanges(HEMOGLOBIN_RCSB_SSE_SNIPPET);

    assert.ok(
      ranges.some(
        (range) =>
          range.type === 'helix' &&
          range.chainId === 'A' &&
          range.startSeqId === '3' &&
          range.endSeqId === '18',
      ),
    );
    assert.ok(
      ranges.some(
        (range) =>
          range.type === 'helix' &&
          range.chainId === 'A' &&
          range.startSeqId === '20' &&
          range.endSeqId === '35',
      ),
    );
  });

  it('annotates PDB residues into helix, sheet, and coil', () => {
    const model = parseStructureModel(SSE_PDB_SNIPPET, 'pdb');
    annotateSecondaryStructure(model, SSE_PDB_SNIPPET);

    const chainA = model.chains.find((chain) => chain.chainId === 'A');
    const chainB = model.chains.find((chain) => chain.chainId === 'B');
    assert.ok(chainA && chainB);

    const coilA = chainA.residues.find((residue) => residue.seqId === '1');
    const helixA = chainA.residues.find((residue) => residue.seqId === '3');
    const coilTailA = chainA.residues.find((residue) => residue.seqId === '5');
    const sheetB = chainB.residues.find((residue) => residue.seqId === '1');

    assert.equal(coilA?.secondaryStructure, 'coil');
    assert.equal(helixA?.secondaryStructure, 'helix');
    assert.equal(coilTailA?.secondaryStructure, 'coil');
    assert.equal(sheetB?.secondaryStructure, 'sheet');
  });

  it('annotates RCSB-style 1UBQ residues with helix and sheet segments', () => {
    const model = parseStructureModel(UBIQUITIN_RCSB_SSE_SNIPPET, 'pdb');
    annotateSecondaryStructure(model, UBIQUITIN_RCSB_SSE_SNIPPET);

    const chainA = model.chains.find((chain) => chain.chainId === 'A');
    assert.ok(chainA);

    assert.equal(chainA.residues.find((residue) => residue.seqId === '9')?.secondaryStructure, 'coil');
    assert.equal(chainA.residues.find((residue) => residue.seqId === '12')?.secondaryStructure, 'sheet');
    assert.equal(chainA.residues.find((residue) => residue.seqId === '25')?.secondaryStructure, 'helix');
    assert.equal(chainA.residues.find((residue) => residue.seqId === '57')?.secondaryStructure, 'helix');

    const segments = buildCartoonSegments(model);
    const segmentTypes = new Set(segments.map((segment) => segment.type));

    assert.ok(segmentTypes.has('helix'));
    assert.ok(segmentTypes.has('sheet'));
    assert.ok(segmentTypes.has('coil'));
    assert.ok(segments.length > 3);
  });

  it('annotates RCSB-style 1HHO residues predominantly as helix', () => {
    const model = parseStructureModel(HEMOGLOBIN_RCSB_SSE_SNIPPET, 'pdb');
    annotateSecondaryStructure(model, HEMOGLOBIN_RCSB_SSE_SNIPPET);

    const chainA = model.chains.find((chain) => chain.chainId === 'A');
    assert.ok(chainA);

    const polymerResidues = chainA.residues.filter((residue) => residue.isPolymer);
    const helixCount = polymerResidues.filter((residue) => residue.secondaryStructure === 'helix').length;

    assert.equal(chainA.residues.find((residue) => residue.seqId === '10')?.secondaryStructure, 'helix');
    assert.equal(chainA.residues.find((residue) => residue.seqId === '19')?.secondaryStructure, 'coil');
    assert.equal(chainA.residues.find((residue) => residue.seqId === '25')?.secondaryStructure, 'helix');
    assert.ok(helixCount >= 30);
  });

  it('parses mmCIF secondary-structure loops into normalized ranges', () => {
    const ranges = parseMmcifSecondaryStructureRanges(SSE_MMCIF_SNIPPET);

    assert.ok(ranges.some((range) => range.type === 'helix' && range.chainId === 'A'));
    assert.ok(ranges.some((range) => range.type === 'sheet' && range.chainId === 'B'));
  });

  it('defaults unannotated PDB residues to coil', () => {
    const model = parseStructureModel(MULTI_CHAIN_PDB_SNIPPET, 'pdb');
    annotateSecondaryStructure(model, MULTI_CHAIN_PDB_SNIPPET);

    for (const chain of model.chains) {
      for (const residue of chain.residues) {
        if (residue.isPolymer) {
          assert.equal(residue.secondaryStructure, 'coil');
        }
      }
    }
  });

  it('annotates mmCIF residues using the same representation as PDB', () => {
    const model = parseStructureModel(SSE_MMCIF_SNIPPET, 'mmcif');
    annotateSecondaryStructure(model, SSE_MMCIF_SNIPPET);

    const chainA = model.chains.find((chain) => chain.chainId === 'A');
    const chainB = model.chains.find((chain) => chain.chainId === 'B');
    assert.ok(chainA && chainB);

    assert.equal(
      chainA.residues.find((residue) => residue.seqId === '2')?.secondaryStructure,
      'helix',
    );
    assert.equal(
      chainB.residues.find((residue) => residue.seqId === '1')?.secondaryStructure,
      'sheet',
    );
    assert.equal(
      chainA.residues.find((residue) => residue.seqId === '1')?.secondaryStructure,
      'coil',
    );
  });
});
