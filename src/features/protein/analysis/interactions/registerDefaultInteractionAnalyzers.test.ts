import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { defaultInteractionRegistry } from './InteractionRegistry';
import { InteractionType } from './InteractionTypes';
import { hydrogenBondAnalyzer } from './HydrogenBondAnalyzer';
import './registerDefaultInteractionAnalyzers';

describe('registerDefaultInteractionAnalyzers', () => {
  it('registers HydrogenBondAnalyzer on the default registry', () => {
    assert.equal(defaultInteractionRegistry.has(InteractionType.HYDROGEN_BOND), true);
    assert.equal(
      defaultInteractionRegistry.getByType(InteractionType.HYDROGEN_BOND),
      hydrogenBondAnalyzer,
    );
  });
});
