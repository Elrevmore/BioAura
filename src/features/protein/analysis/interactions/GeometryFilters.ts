import type { InteractionCandidate } from './InteractionCandidate';

export type CandidateFilter = (candidate: InteractionCandidate) => boolean;

export function withinDistance(maxAngstrom: number): CandidateFilter {
  return (candidate) => candidate.distanceAngstrom <= maxAngstrom;
}

export function sameResidue(): CandidateFilter {
  return (candidate) => candidate.sourceResidue === candidate.targetResidue;
}

export function differentResidue(): CandidateFilter {
  return (candidate) => candidate.sourceResidue !== candidate.targetResidue;
}

export function sameChain(): CandidateFilter {
  return (candidate) => candidate.sourceChainId === candidate.targetChainId;
}

export function differentChain(): CandidateFilter {
  return (candidate) => candidate.sourceChainId !== candidate.targetChainId;
}

export function composeFilters(
  ...filters: readonly CandidateFilter[]
): CandidateFilter {
  return (candidate) => filters.every((filter) => filter(candidate));
}

export function applyFilters(
  candidates: InteractionCandidate[],
  filters: readonly CandidateFilter[],
): InteractionCandidate[] {
  if (filters.length === 0) {
    return candidates;
  }
  const composed = composeFilters(...filters);
  return candidates.filter(composed);
}
