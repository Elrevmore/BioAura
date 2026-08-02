/**
 * Central interaction type registry.
 * Placeholder types are registered for future analyzer plugins.
 */
export const InteractionType = {
  HYDROGEN_BOND: 'hydrogen-bond',
  SALT_BRIDGE: 'salt-bridge',
  HYDROPHOBIC_CONTACT: 'hydrophobic-contact',
  VAN_DER_WAALS: 'van-der-waals',
  STERIC_CLASH: 'steric-clash',
  METAL_COORDINATION: 'metal-coordination',
  PI_STACKING: 'pi-stacking',
  CATION_PI: 'cation-pi',
} as const;

export type InteractionType = (typeof InteractionType)[keyof typeof InteractionType];

export interface InteractionTypeDescriptor {
  type: InteractionType;
  label: string;
  /** True once a plugin analyzer is registered and implemented. */
  implemented: boolean;
}

export const INTERACTION_TYPE_REGISTRY: readonly InteractionTypeDescriptor[] = [
  { type: InteractionType.HYDROGEN_BOND, label: 'Hydrogen Bond', implemented: true },
  { type: InteractionType.SALT_BRIDGE, label: 'Salt Bridge', implemented: false },
  { type: InteractionType.HYDROPHOBIC_CONTACT, label: 'Hydrophobic Contact', implemented: false },
  { type: InteractionType.VAN_DER_WAALS, label: 'Van der Waals Contact', implemented: false },
  { type: InteractionType.STERIC_CLASH, label: 'Steric Clash', implemented: false },
  { type: InteractionType.METAL_COORDINATION, label: 'Metal Coordination', implemented: false },
  { type: InteractionType.PI_STACKING, label: 'π-π Stacking', implemented: false },
  { type: InteractionType.CATION_PI, label: 'Cation-π', implemented: false },
] as const;

const registryByType = new Map(
  INTERACTION_TYPE_REGISTRY.map((entry) => [entry.type, entry]),
);

export function getInteractionTypeDescriptor(
  type: InteractionType,
): InteractionTypeDescriptor | undefined {
  return registryByType.get(type);
}

export function getAllInteractionTypes(): readonly InteractionType[] {
  return INTERACTION_TYPE_REGISTRY.map((entry) => entry.type);
}
