/** Maximum donor–acceptor distance (Å) for hydrogen-bond detection. */
export const HYDROGEN_BOND_MAX_DISTANCE_ANGSTROM = 3.5;

export const HYDROGEN_BOND_REASON =
  'Donor–acceptor distance within hydrogen bond cutoff.';

/**
 * Distance-based confidence tiers (no angle criterion in Phase 8).
 */
export function calculateHydrogenBondConfidence(distanceAngstrom: number): number {
  if (distanceAngstrom < 2.7) {
    return 1.0;
  }
  if (distanceAngstrom < 3.0) {
    return 0.8;
  }
  if (distanceAngstrom < 3.3) {
    return 0.6;
  }
  if (distanceAngstrom <= HYDROGEN_BOND_MAX_DISTANCE_ANGSTROM) {
    return 0.4;
  }
  return 0;
}
