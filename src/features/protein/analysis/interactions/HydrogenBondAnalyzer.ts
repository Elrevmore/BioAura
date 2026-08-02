import { differentResidue, withinDistance } from './GeometryFilters';
import type { InteractionAnalysisContext } from './InteractionAnalyzer';
import type { InteractionAnalyzer } from './InteractionAnalyzer';
import type { InteractionResult } from './InteractionResult';
import {
  HYDROGEN_BOND_MAX_DISTANCE_ANGSTROM,
  HYDROGEN_BOND_REASON,
  calculateHydrogenBondConfidence,
} from './hydrogenBondConfidence';
import {
  hydrogenBondPairKey,
  orientHydrogenBondPair,
} from './hydrogenBondDetection';
import { InteractionType } from './InteractionTypes';

/**
 * Detects hydrogen bonds from pre-filtered interaction candidates.
 * Neighbor search is performed exclusively by InteractionEngine.
 */
export const hydrogenBondAnalyzer: InteractionAnalyzer = {
  type: InteractionType.HYDROGEN_BOND,
  candidateFilters: [
    differentResidue(),
    withinDistance(HYDROGEN_BOND_MAX_DISTANCE_ANGSTROM),
  ],

  analyze(context: InteractionAnalysisContext): InteractionResult[] {
    const seen = new Set<string>();
    const results: InteractionResult[] = [];

    for (const candidate of context.candidates) {
      const oriented = orientHydrogenBondPair(candidate);
      if (!oriented) {
        continue;
      }

      const key = hydrogenBondPairKey(oriented);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const confidence = calculateHydrogenBondConfidence(candidate.distanceAngstrom);
      if (confidence <= 0) {
        continue;
      }

      results.push({
        type: InteractionType.HYDROGEN_BOND,
        sourceAtom: oriented.donorAtom,
        targetAtom: oriented.acceptorAtom,
        sourceResidue: oriented.donorResidue,
        targetResidue: oriented.acceptorResidue,
        sourceChainId: oriented.donorChainId,
        targetChainId: oriented.acceptorChainId,
        distanceAngstrom: candidate.distanceAngstrom,
        confidence,
        reason: HYDROGEN_BOND_REASON,
      });
    }

    results.sort((left, right) => left.distanceAngstrom - right.distanceAngstrom);
    return results;
  },
};
