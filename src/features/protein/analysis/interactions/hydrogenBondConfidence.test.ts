import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HYDROGEN_BOND_MAX_DISTANCE_ANGSTROM,
  calculateHydrogenBondConfidence,
} from './hydrogenBondConfidence';

describe('calculateHydrogenBondConfidence', () => {
  it('maps distance tiers to confidence values', () => {
    assert.equal(calculateHydrogenBondConfidence(2.5), 1.0);
    assert.equal(calculateHydrogenBondConfidence(2.85), 0.8);
    assert.equal(calculateHydrogenBondConfidence(3.1), 0.6);
    assert.equal(calculateHydrogenBondConfidence(3.4), 0.4);
    assert.equal(calculateHydrogenBondConfidence(HYDROGEN_BOND_MAX_DISTANCE_ANGSTROM), 0.4);
    assert.equal(calculateHydrogenBondConfidence(3.6), 0);
  });
});
