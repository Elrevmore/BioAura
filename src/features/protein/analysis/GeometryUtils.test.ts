import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  distance,
  distanceSquared,
  midpoint,
  vec3FromAtom,
} from './GeometryUtils';
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

describe('GeometryUtils', () => {
  it('computes distance squared in O(1)', () => {
    const a = { x: 0, y: 0, z: 0 };
    const b = { x: 3, y: 4, z: 0 };
    assert.equal(distanceSquared(a, b), 25);
  });

  it('computes midpoint between two points', () => {
    const a = { x: 0, y: 0, z: 0 };
    const b = { x: 4, y: 6, z: 8 };
    assert.deepEqual(midpoint(a, b), { x: 2, y: 3, z: 4 });
  });

  it('maps atoms to vec3', () => {
    assert.deepEqual(vec3FromAtom(atom(1, 2, 3)), { x: 1, y: 2, z: 3 });
  });

  it('computes euclidean distance', () => {
    assert.equal(distance({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 }), 5);
  });
});
