import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { StructureAtom, StructureResidue } from '../../types/structure-model.types';
import type { InteractionCandidate } from './InteractionCandidate';
import { hydrogenBondAnalyzer } from './HydrogenBondAnalyzer';
import { applyFilters } from './GeometryFilters';
import { InteractionType } from './InteractionTypes';
import { parseStructureModel } from '../../parsers/parseStructureModel';

const HBOND_SNIPPET = `ATOM      1  OD1 ASP A   1       0.000   0.000   0.000  1.00  0.00           O
ATOM      2  CG  ASP A   1       1.000   0.000   0.000  1.00  0.00           C
ATOM      3  OG  SER A   2       2.500   0.000   0.000  1.00  0.00           O
ATOM      4  CB  SER A   2       3.500   0.000   0.000  1.00  0.00           C
ATOM      5  OD1 ASP A   3       4.500   0.000   0.000  1.00  0.00           O
`;

function candidateFromAtoms(
  source: { atom: StructureAtom; residue: StructureResidue; chainId: string },
  target: { atom: StructureAtom; residue: StructureResidue; chainId: string },
  distanceAngstrom: number,
): InteractionCandidate {
  return {
    sourceAtom: source.atom,
    targetAtom: target.atom,
    sourceResidue: source.residue,
    targetResidue: target.residue,
    sourceChainId: source.chainId,
    targetChainId: target.chainId,
    distanceAngstrom,
  };
}

describe('HydrogenBondAnalyzer', () => {
  it('detects a valid donor–acceptor pair within cutoff', () => {
    const model = parseStructureModel(HBOND_SNIPPET, 'pdb');
    const asp = model.chains[0].residues[0];
    const ser = model.chains[0].residues[1];
    const donor = ser.atoms.find((atom) => atom.name.trim() === 'OG');
    const acceptor = asp.atoms.find((atom) => atom.name.trim() === 'OD1');
    assert.ok(donor);
    assert.ok(acceptor);

    const candidate = candidateFromAtoms(
      { atom: donor, residue: ser, chainId: 'A' },
      { atom: acceptor, residue: asp, chainId: 'A' },
      2.5,
    );

    const filtered = applyFilters([candidate], hydrogenBondAnalyzer.candidateFilters);
    assert.equal(filtered.length, 1);

    const results = hydrogenBondAnalyzer.analyze({
      model,
      query: {
        model,
        selection: { kind: 'atom', atom: donor, residue: ser, chainId: 'A' },
      },
      candidates: filtered,
    });

    assert.equal(results.length, 1);
    assert.equal(results[0].type, InteractionType.HYDROGEN_BOND);
    assert.equal(results[0].sourceAtom, donor);
    assert.equal(results[0].targetAtom, acceptor);
    assert.equal(results[0].confidence, 1.0);
    assert.match(results[0].reason, /hydrogen bond cutoff/i);
  });

  it('rejects pairs beyond 3.5 Å via geometry filters', () => {
    const model = parseStructureModel(HBOND_SNIPPET, 'pdb');
    const asp = model.chains[0].residues[0];
    const farAsp = model.chains[0].residues[2];
    const donor = asp.atoms[0];
    const acceptor = farAsp.atoms[0];

    const candidate = candidateFromAtoms(
      { atom: donor, residue: asp, chainId: 'A' },
      { atom: acceptor, residue: farAsp, chainId: 'A' },
      4.5,
    );

    const filtered = applyFilters([candidate], hydrogenBondAnalyzer.candidateFilters);
    assert.equal(filtered.length, 0);
  });

  it('rejects non-donor and non-acceptor atom pairs', () => {
    const model = parseStructureModel(HBOND_SNIPPET, 'pdb');
    const asp = model.chains[0].residues[0];
    const cg = asp.atoms.find((atom) => atom.name.trim() === 'CG');
    const cb = model.chains[0].residues[1].atoms.find((atom) => atom.name.trim() === 'CB');
    assert.ok(cg);
    assert.ok(cb);

    const candidate = candidateFromAtoms(
      { atom: cg, residue: asp, chainId: 'A' },
      { atom: cb, residue: model.chains[0].residues[1], chainId: 'A' },
      2.0,
    );

    const results = hydrogenBondAnalyzer.analyze({
      model,
      query: {
        model,
        selection: { kind: 'atom', atom: cg, residue: asp, chainId: 'A' },
      },
      candidates: [candidate],
    });

    assert.equal(results.length, 0);
  });

  it('rejects same-residue pairs through geometry filters', () => {
    const model = parseStructureModel(HBOND_SNIPPET, 'pdb');
    const asp = model.chains[0].residues[0];
    const od1 = asp.atoms.find((atom) => atom.name.trim() === 'OD1');
    const cg = asp.atoms.find((atom) => atom.name.trim() === 'CG');
    assert.ok(od1);
    assert.ok(cg);

    const candidate = candidateFromAtoms(
      { atom: od1, residue: asp, chainId: 'A' },
      { atom: cg, residue: asp, chainId: 'A' },
      1.0,
    );

    const filtered = applyFilters([candidate], hydrogenBondAnalyzer.candidateFilters);
    assert.equal(filtered.length, 0);
  });

  it('deduplicates symmetric donor–acceptor orientations', () => {
    const model = parseStructureModel(HBOND_SNIPPET, 'pdb');
    const asp = model.chains[0].residues[0];
    const ser = model.chains[0].residues[1];
    const donor = ser.atoms.find((atom) => atom.name.trim() === 'OG');
    const acceptor = asp.atoms.find((atom) => atom.name.trim() === 'OD1');
    assert.ok(donor);
    assert.ok(acceptor);

    const forward = candidateFromAtoms(
      { atom: donor, residue: ser, chainId: 'A' },
      { atom: acceptor, residue: asp, chainId: 'A' },
      2.5,
    );
    const reverse = candidateFromAtoms(
      { atom: acceptor, residue: asp, chainId: 'A' },
      { atom: donor, residue: ser, chainId: 'A' },
      2.5,
    );

    const results = hydrogenBondAnalyzer.analyze({
      model,
      query: {
        model,
        selection: { kind: 'residue', residue: ser, chainId: 'A' },
      },
      candidates: [forward, reverse],
    });

    assert.equal(results.length, 1);
  });
});
