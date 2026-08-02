import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findNeighborAtoms, findNeighborResidues } from './NeighborAnalyzer';
import { parseStructureModel } from '../parsers/parseStructureModel';

const NEIGHBOR_SNIPPET = `ATOM      1  CA  ALA A   1       0.000   0.000   0.000  1.00  0.00           C
ATOM      2  CA  GLY A   2       3.000   0.000   0.000  1.00  0.00           C
ATOM      3  CA  VAL A   3       4.000   0.000   0.000  1.00  0.00           C
ATOM      4  CA  LEU A   4      12.000   0.000   0.000  1.00  0.00           C
`;

describe('NeighborAnalyzer', () => {
  it('finds atoms within radius sorted by distance', () => {
    const model = parseStructureModel(NEIGHBOR_SNIPPET, 'pdb');
    const queryAtom = model.chains[0].residues[0].atoms[0];

    const neighbors = findNeighborAtoms(model, {
      atom: queryAtom,
      radiusAngstrom: 5,
    });

    assert.equal(neighbors.length, 2);
    assert.ok(neighbors[0].distance <= neighbors[1].distance);
    assert.equal(neighbors[0].residue.name, 'GLY');
    assert.equal(neighbors[1].residue.name, 'VAL');
  });

  it('finds neighbor residues by centroid distance', () => {
    const model = parseStructureModel(NEIGHBOR_SNIPPET, 'pdb');
    const queryResidue = model.chains[0].residues[0];

    const neighbors = findNeighborResidues(model, {
      residue: queryResidue,
      chainId: 'A',
      radiusAngstrom: 5,
    });

    assert.equal(neighbors.length, 2);
    assert.equal(neighbors[0].residue.name, 'GLY');
    assert.ok(neighbors[0].distance < neighbors[1].distance);
  });

  it('excludes the query residue from neighbor residue results', () => {
    const model = parseStructureModel(NEIGHBOR_SNIPPET, 'pdb');
    const queryResidue = model.chains[0].residues[0];

    const neighbors = findNeighborResidues(model, {
      residue: queryResidue,
      chainId: 'A',
      radiusAngstrom: 20,
    });

    assert.ok(
      neighbors.every(
        (neighbor) => neighbor.residue !== queryResidue,
      ),
    );
  });
});
