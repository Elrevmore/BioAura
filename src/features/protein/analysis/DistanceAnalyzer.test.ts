import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { distance } from './DistanceAnalyzer';
import type { StructureAtom } from '../types/structure-model.types';

function atom(x: number, y: number, z: number): StructureAtom {
  return {
    name: 'CA',
    element: 'C',
    x,
    y,
    z,
    recordGroup: 'ATOM',
    isPolymer: true,
  };
}

describe('DistanceAnalyzer', () => {
  it('returns angstrom, nanometer, vector, and midpoint', () => {
    const result = distance(atom(0, 0, 0), atom(3, 4, 0));

    assert.equal(result.distanceAngstrom, 5);
    assert.equal(result.distanceNanometer, 0.5);
    assert.equal(result.distanceSquared, 25);
    assert.deepEqual(result.distanceVector, { x: 3, y: 4, z: 0 });
    assert.deepEqual(result.midpoint, { x: 1.5, y: 2, z: 0 });
  });
});
