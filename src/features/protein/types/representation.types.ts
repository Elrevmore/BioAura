/**
 * Identifiers for protein representation layers under `protein-structure`.
 * Extend this union when new geometry layers are added (surface, ball-and-stick, etc.).
 */
export type RepresentationLayerId = 'cartoon' | 'ligands' | 'polymer-atoms';

/** Visibility state for each representation layer. */
export type ProteinRepresentationState = Record<RepresentationLayerId, boolean>;

export const DEFAULT_PROTEIN_REPRESENTATION: ProteinRepresentationState = {
  cartoon: true,
  ligands: true,
  'polymer-atoms': false,
};

/** Maps layer ids to Three.js group names produced by `buildProteinGroup`. */
export const REPRESENTATION_LAYER_NAMES: Record<RepresentationLayerId, string> = {
  cartoon: 'cartoon',
  ligands: 'ligands',
  'polymer-atoms': 'polymer-atoms',
};

export interface RepresentationLayerDefinition {
  id: RepresentationLayerId;
  label: string;
}

/** Ordered list for UI and iteration — add future layers here. */
export const REPRESENTATION_LAYERS: readonly RepresentationLayerDefinition[] = [
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'ligands', label: 'Ligands' },
  { id: 'polymer-atoms', label: 'Polymer Atoms' },
] as const;
