import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  findAtomByName,
  getCaTrace,
  getNonPolymerResidues,
  getPolymerResidues,
} from '../core/structureModelQueries';
import {
  HEMOGLOBIN_PDB_SNIPPET,
  MMCIF_FALLBACK_SNIPPET,
} from './parseStructureModel.fixtures';
import { parseStructureModel } from './parseStructureModel';

describe('parseStructureModel', () => {
  it('normalizes 1HHO-style PDB into chains, residues, and atoms', () => {
    const model = parseStructureModel(HEMOGLOBIN_PDB_SNIPPET, 'pdb');

    assert.equal(model.format, 'pdb');
    assert.ok(model.chains.length >= 1);

    const chainA = model.chains.find((chain) => chain.chainId === 'A');
    assert.ok(chainA);
    assert.ok(chainA.residues.length >= 2);

    const valResidue = chainA.residues.find((residue) => residue.name === 'VAL' && residue.seqId === '1');
    assert.ok(valResidue);
    assert.equal(valResidue.isPolymer, true);
    assert.equal(valResidue.recordGroup, 'ATOM');

    const ca = findAtomByName(valResidue, 'CA');
    assert.ok(ca);
    assert.equal(ca.element, 'C');
    assert.equal(ca.x, 6.07);
    assert.equal(ca.isPolymer, true);

    const polymer = getPolymerResidues(model);
    const nonPolymer = getNonPolymerResidues(model);
    assert.ok(polymer.length >= 2);
    assert.ok(nonPolymer.some((residue) => residue.name === 'HEM'));
    assert.ok(nonPolymer.every((residue) => !residue.isPolymer));

    const caTrace = getCaTrace(model);
    assert.ok(caTrace.some((entry) => entry.chainId === 'A' && entry.atoms.length >= 2));
  });

  it('normalizes mmCIF fallback into the same structural shape', () => {
    const model = parseStructureModel(MMCIF_FALLBACK_SNIPPET, 'mmcif');

    assert.equal(model.format, 'mmcif');

    const chainA = model.chains.find((chain) => chain.chainId === 'A');
    assert.ok(chainA);

    const valResidue = chainA.residues.find((residue) => residue.name === 'VAL');
    assert.ok(valResidue);
    assert.equal(valResidue.isPolymer, true);

    const n = findAtomByName(valResidue, 'N');
    const c = findAtomByName(valResidue, 'C');
    const o = findAtomByName(valResidue, 'O');
    assert.ok(n && c && o);
    assert.equal(n.element, 'N');
    assert.equal(c.element, 'C');
    assert.equal(o.element, 'O');

    const heme = chainA.residues.find((residue) => residue.name === 'HEM');
    assert.ok(heme);
    assert.equal(heme.isPolymer, false);
    assert.equal(heme.recordGroup, 'HETATM');
    assert.ok(findAtomByName(heme, 'FE'));
  });
});
