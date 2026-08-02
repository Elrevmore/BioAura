import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { InteractionCandidate } from './InteractionCandidate';
import {
  applyFilters,
  composeFilters,
  differentChain,
  differentResidue,
  sameResidue,
  withinDistance,
} from './GeometryFilters';

function candidate(overrides: Partial<InteractionCandidate> = {}): InteractionCandidate {
  return {
    sourceAtom: { name: 'N', element: 'N', x: 0, y: 0, z: 0, recordGroup: 'ATOM', isPolymer: true },
    targetAtom: { name: 'O', element: 'O', x: 1, y: 0, z: 0, recordGroup: 'ATOM', isPolymer: true },
    sourceResidue: {
      name: 'ALA',
      seqId: '1',
      seqNumber: 1,
      recordGroup: 'ATOM',
      isPolymer: true,
      atoms: [],
    },
    targetResidue: {
      name: 'GLY',
      seqId: '2',
      seqNumber: 2,
      recordGroup: 'ATOM',
      isPolymer: true,
      atoms: [],
    },
    sourceChainId: 'A',
    targetChainId: 'A',
    distanceAngstrom: 3,
    ...overrides,
  };
}

describe('GeometryFilters', () => {
  it('filters by distance threshold', () => {
    const candidates = [
      candidate({ distanceAngstrom: 2.5 }),
      candidate({ distanceAngstrom: 6.0 }),
    ];
    const filtered = applyFilters(candidates, [withinDistance(5)]);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].distanceAngstrom, 2.5);
  });

  it('composes residue and chain predicates', () => {
    const crossChain = candidate({
      targetChainId: 'B',
      targetResidue: {
        name: 'GLY',
        seqId: '2',
        seqNumber: 2,
        recordGroup: 'ATOM',
        isPolymer: true,
        atoms: [],
      },
    });
    const sameResidueSameChain = candidate({
      sourceResidue: crossChain.sourceResidue,
      targetResidue: crossChain.sourceResidue,
      targetChainId: 'A',
    });

    assert.equal(differentChain()(crossChain), true);
    assert.equal(differentResidue()(crossChain), true);
    assert.equal(
      composeFilters(differentResidue(), differentChain())(crossChain),
      true,
    );
    assert.equal(
      composeFilters(differentResidue(), differentChain())(sameResidueSameChain),
      false,
    );
    assert.equal(sameResidue()(sameResidueSameChain), true);
  });
});
