import type { InteractionAnalyzer } from './InteractionAnalyzer';
import type { InteractionType } from './InteractionTypes';

/**
 * Registry of interaction analyzer plugins keyed by interaction type.
 */
export class InteractionRegistry {
  private readonly analyzers = new Map<InteractionType, InteractionAnalyzer>();

  register(analyzer: InteractionAnalyzer): void {
    this.analyzers.set(analyzer.type, analyzer);
  }

  unregister(type: InteractionType): void {
    this.analyzers.delete(type);
  }

  getAnalyzers(): InteractionAnalyzer[] {
    return [...this.analyzers.values()];
  }

  getByType(type: InteractionType): InteractionAnalyzer | undefined {
    return this.analyzers.get(type);
  }

  has(type: InteractionType): boolean {
    return this.analyzers.has(type);
  }

  clear(): void {
    this.analyzers.clear();
  }
}

/** Default global registry — plugins register here at module load time. */
export const defaultInteractionRegistry = new InteractionRegistry();
