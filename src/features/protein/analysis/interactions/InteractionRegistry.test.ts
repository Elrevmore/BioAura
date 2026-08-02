import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InteractionRegistry } from './InteractionRegistry';
import { InteractionType } from './InteractionTypes';
import type { InteractionAnalyzer } from './InteractionAnalyzer';

const stubAnalyzer = (type: InteractionAnalyzer['type']): InteractionAnalyzer => ({
  type,
  candidateFilters: [],
  analyze: () => [],
});

describe('InteractionRegistry', () => {
  it('registers and retrieves analyzers by type', () => {
    const registry = new InteractionRegistry();
    const analyzer = stubAnalyzer(InteractionType.SALT_BRIDGE);
    registry.register(analyzer);

    assert.equal(registry.has(InteractionType.SALT_BRIDGE), true);
    assert.equal(registry.getByType(InteractionType.SALT_BRIDGE), analyzer);
    assert.equal(registry.getAnalyzers().length, 1);
  });

  it('unregisters analyzers', () => {
    const registry = new InteractionRegistry();
    registry.register(stubAnalyzer(InteractionType.HYDROGEN_BOND));
    registry.unregister(InteractionType.HYDROGEN_BOND);
    assert.equal(registry.has(InteractionType.HYDROGEN_BOND), false);
  });
});
