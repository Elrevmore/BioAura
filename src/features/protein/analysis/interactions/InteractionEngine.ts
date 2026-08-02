import {
  GeometryAnalysisEngine,
  geometryAnalysisEngine,
} from '../GeometryAnalysisEngine';
import { DEFAULT_NEIGHBOR_RADIUS_ANGSTROM } from '../geometry.types';
import { applyFilters } from './GeometryFilters';
import type { InteractionAnalysisContext, InteractionAnalyzer } from './InteractionAnalyzer';
import {
  buildInteractionCandidates,
  resolveSourceAtoms,
} from './buildInteractionCandidates';
import type { InteractionAnalysisOutput, InteractionQuery } from './InteractionQuery';
import {
  InteractionRegistry,
  defaultInteractionRegistry,
} from './InteractionRegistry';

/**
 * Orchestrates the interaction pipeline:
 * selection → neighbor search (once) → candidates → analyzer plugins → results.
 */
export class InteractionEngine {
  constructor(
    private readonly geometry: GeometryAnalysisEngine = geometryAnalysisEngine,
    private readonly registry: InteractionRegistry = defaultInteractionRegistry,
  ) {}

  analyze(query: InteractionQuery): InteractionAnalysisOutput {
    const radius = query.radiusAngstrom ?? DEFAULT_NEIGHBOR_RADIUS_ANGSTROM;
    const neighbors = this.findNeighborsOnce(query, radius);
    const sources = resolveSourceAtoms(query.selection);
    const candidates = buildInteractionCandidates(sources, neighbors, this.geometry);

    const interactions = this.runAnalyzers(query, candidates);

    return { candidates, interactions };
  }

  getRegisteredAnalyzers(): InteractionAnalyzer[] {
    return this.registry.getAnalyzers();
  }

  private findNeighborsOnce(query: InteractionQuery, radiusAngstrom: number) {
    const { model, selection } = query;

    switch (selection.kind) {
      case 'atom':
        return this.geometry.findNeighborAtoms(model, {
          atom: selection.atom,
          radiusAngstrom,
        });
      case 'residue':
        return this.geometry.findNeighborAtoms(model, {
          residue: selection.residue,
          chainId: selection.chainId,
          radiusAngstrom,
        });
      case 'ligand':
        return this.geometry.findNeighborAtoms(model, {
          residue: selection.residue,
          chainId: selection.chainId,
          radiusAngstrom,
        });
      default:
        return [];
    }
  }

  private runAnalyzers(
    query: InteractionQuery,
    candidates: InteractionAnalysisOutput['candidates'],
  ) {
    const analyzers = this.registry.getAnalyzers();
    if (analyzers.length === 0) {
      return [];
    }

    const interactions: InteractionAnalysisOutput['interactions'] = [];

    for (const analyzer of analyzers) {
      const filtered = applyFilters(candidates, analyzer.candidateFilters);
      const context: InteractionAnalysisContext = {
        model: query.model,
        query,
        candidates: filtered,
      };
      interactions.push(...analyzer.analyze(context));
    }

    return interactions;
  }
}

/** Shared interaction engine instance for UI and future tools. */
export const interactionEngine = new InteractionEngine();
