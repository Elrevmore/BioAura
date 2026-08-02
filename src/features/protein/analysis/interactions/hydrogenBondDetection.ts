import type { StructureAtom, StructureResidue } from '../../types/structure-model.types';
import {
  isAcceptorAtom,
  isCrystallographicWater,
  isDonorAtom,
  isLigandCompatibleResidue,
} from './donorAcceptorDatabase';
import type { InteractionCandidate } from './InteractionCandidate';

export interface OrientedHydrogenBondPair {
  donorAtom: StructureAtom;
  acceptorAtom: StructureAtom;
  donorResidue: StructureResidue;
  acceptorResidue: StructureResidue;
  donorChainId: string;
  acceptorChainId: string;
}

export function isExplicitHydrogenAtom(atom: StructureAtom): boolean {
  const element = atom.element.trim().toUpperCase();
  return element === 'H' || element === 'D';
}

export function orientHydrogenBondPair(
  candidate: InteractionCandidate,
): OrientedHydrogenBondPair | null {
  if (
    isCrystallographicWater(candidate.sourceResidue.name) ||
    isCrystallographicWater(candidate.targetResidue.name)
  ) {
    return null;
  }

  if (
    !isLigandCompatibleResidue(candidate.sourceResidue.isPolymer) ||
    !isLigandCompatibleResidue(candidate.targetResidue.isPolymer)
  ) {
    return null;
  }

  if (
    isExplicitHydrogenAtom(candidate.sourceAtom) ||
    isExplicitHydrogenAtom(candidate.targetAtom)
  ) {
    return null;
  }

  const sourceIsDonor = isDonorAtom(
    candidate.sourceAtom.name,
    candidate.sourceResidue.name,
  );
  const sourceIsAcceptor = isAcceptorAtom(
    candidate.sourceAtom.name,
    candidate.sourceResidue.name,
  );
  const targetIsDonor = isDonorAtom(
    candidate.targetAtom.name,
    candidate.targetResidue.name,
  );
  const targetIsAcceptor = isAcceptorAtom(
    candidate.targetAtom.name,
    candidate.targetResidue.name,
  );

  if (sourceIsDonor && targetIsAcceptor) {
    return {
      donorAtom: candidate.sourceAtom,
      acceptorAtom: candidate.targetAtom,
      donorResidue: candidate.sourceResidue,
      acceptorResidue: candidate.targetResidue,
      donorChainId: candidate.sourceChainId,
      acceptorChainId: candidate.targetChainId,
    };
  }

  if (sourceIsAcceptor && targetIsDonor) {
    return {
      donorAtom: candidate.targetAtom,
      acceptorAtom: candidate.sourceAtom,
      donorResidue: candidate.targetResidue,
      acceptorResidue: candidate.sourceResidue,
      donorChainId: candidate.targetChainId,
      acceptorChainId: candidate.sourceChainId,
    };
  }

  return null;
}

export function hydrogenBondPairKey(pair: OrientedHydrogenBondPair): string {
  const donorKey = atomIdentityKey(
    pair.donorAtom,
    pair.donorResidue,
    pair.donorChainId,
  );
  const acceptorKey = atomIdentityKey(
    pair.acceptorAtom,
    pair.acceptorResidue,
    pair.acceptorChainId,
  );
  return `${donorKey}::${acceptorKey}`;
}

function atomIdentityKey(
  atom: StructureAtom,
  residue: StructureResidue,
  chainId: string,
): string {
  return `${chainId}|${residue.seqId}|${residue.name}|${atom.name}|${atom.x},${atom.y},${atom.z}`;
}
