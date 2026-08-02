import type { InteractionResult } from './InteractionResult';
import { InteractionType } from './InteractionTypes';

export interface InspectorInteractionRow {
  label: string;
  value: string;
}

export function getHydrogenBondInteractions(
  interactions: InteractionResult[],
): InteractionResult[] {
  return interactions.filter(
    (interaction) => interaction.type === InteractionType.HYDROGEN_BOND,
  );
}

export function hydrogenBondEmptyMessage(interactions: InteractionResult[]): string {
  return getHydrogenBondInteractions(interactions).length === 0
    ? 'No hydrogen bonds detected.'
    : '';
}

export function buildHydrogenBondInspectorRows(
  interaction: InteractionResult,
): InspectorInteractionRow[] {
  if (interaction.type !== InteractionType.HYDROGEN_BOND) {
    return [];
  }

  return [
    {
      label: 'Type',
      value: 'Hydrogen Bond',
    },
    {
      label: 'Source residue',
      value: `${interaction.sourceResidue.name} ${interaction.sourceResidue.seqId} (${interaction.sourceChainId})`,
    },
    {
      label: 'Target residue',
      value: `${interaction.targetResidue.name} ${interaction.targetResidue.seqId} (${interaction.targetChainId})`,
    },
    {
      label: 'Donor atom',
      value: interaction.sourceAtom.name,
    },
    {
      label: 'Acceptor atom',
      value: interaction.targetAtom.name,
    },
    {
      label: 'Distance',
      value: `${interaction.distanceAngstrom.toFixed(2)} Å`,
    },
    {
      label: 'Confidence',
      value: interaction.confidence.toFixed(1),
    },
    {
      label: 'Reason',
      value: interaction.reason,
    },
  ];
}
