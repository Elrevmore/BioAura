import { defaultInteractionRegistry } from './InteractionRegistry';
import { InteractionType } from './InteractionTypes';
import { hydrogenBondAnalyzer } from './HydrogenBondAnalyzer';

/**
 * Registers built-in interaction analyzers on the default registry.
 */
export function registerDefaultInteractionAnalyzers(): void {
  if (!defaultInteractionRegistry.has(InteractionType.HYDROGEN_BOND)) {
    defaultInteractionRegistry.register(hydrogenBondAnalyzer);
  }
}

registerDefaultInteractionAnalyzers();
