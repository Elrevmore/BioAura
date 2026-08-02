import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GeometryAnalysisEngine } from './GeometryAnalysisEngine';
import { parseStructureModel } from '../parsers/parseStructureModel';

const SNIPPET = `ATOM      1  CA  ALA A   1       0.000   0.000   0.000  1.00  0.00           C
ATOM      2  CA  GLY A   2       3.000   4.000   0.000  1.00  0.00           C
`;

describe('GeometryAnalysisEngine', () => {
  it('exposes distance and neighbor analyzers through one facade', () => {
    const engine = new GeometryAnalysisEngine();
    const model = parseStructureModel(SNIPPET, 'pdb');
    const atomA = model.chains[0].residues[0].atoms[0];
    const atomB = model.chains[0].residues[1].atoms[0];

    const dist = engine.distance(atomA, atomB);
    assert.equal(dist.distanceAngstrom, 5);

    const neighbors = engine.findNeighborAtoms(model, { atom: atomA, radiusAngstrom: 6 });
    assert.equal(neighbors.length, 1);
    assert.equal(neighbors[0].atom, atomB);
  });
});
