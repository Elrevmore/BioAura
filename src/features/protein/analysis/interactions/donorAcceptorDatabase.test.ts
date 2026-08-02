import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isAcceptorAtom,
  isCrystallographicWater,
  isDonorAtom,
  lookupDonorAcceptorRole,
} from './donorAcceptorDatabase';

describe('donorAcceptorDatabase', () => {
  it('looks up amino-acid donor and acceptor roles from tables', () => {
    const asp = lookupDonorAcceptorRole('ASP');
    assert.ok(asp);
    assert.deepEqual([...asp.acceptors], ['OD1', 'OD2']);
    assert.equal(isDonorAtom('OD1', 'ASP'), false);
    assert.equal(isAcceptorAtom('OD1', 'ASP'), true);
  });

  it('uses common backbone atom tables', () => {
    assert.equal(isDonorAtom('N', 'GLY'), true);
    assert.equal(isAcceptorAtom('O', 'GLY'), true);
  });

  it('excludes crystallographic water per handling rules', () => {
    assert.equal(isCrystallographicWater('HOH'), true);
    assert.equal(isDonorAtom('O', 'HOH'), false);
    assert.equal(isAcceptorAtom('O', 'HOH'), false);
  });

  it('supports ligand heterogen atoms via common tables', () => {
    assert.equal(isAcceptorAtom('OE1', 'LIG'), true);
  });
});
