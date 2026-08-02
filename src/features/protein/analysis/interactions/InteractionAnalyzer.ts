import type { StructureModel } from '../../types/structure-model.types';
import type { InteractionCandidate } from './InteractionCandidate';
import type { InteractionResult } from './InteractionResult';
import type { InteractionQuery } from './InteractionQuery';
import type { InteractionType } from './InteractionTypes';
import type { CandidateFilter } from './GeometryFilters';

export interface InteractionAnalysisContext {
  model: StructureModel;
  query: InteractionQuery;
  candidates: InteractionCandidate[];
}

/**
 * Plugin contract for interaction analyzers.
 * Analyzers must not perform their own neighbor search.
 */
export interface InteractionAnalyzer {
  readonly type: InteractionType;
  readonly candidateFilters: readonly CandidateFilter[];
  analyze(context: InteractionAnalysisContext): InteractionResult[];
}
