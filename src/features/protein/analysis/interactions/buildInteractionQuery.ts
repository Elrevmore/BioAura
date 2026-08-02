import type { AtomSelection, SelectedObject } from '../../types/selection.types';
import type { StructureModel } from '../../types/structure-model.types';
import type { InteractionQuery, InteractionSelection } from './InteractionQuery';

export function selectionToInteractionSelection(
  selectedObject: SelectedObject | null,
  atomSelections: AtomSelection[],
): InteractionSelection | null {
  if (atomSelections.length > 0) {
    const latest = atomSelections[atomSelections.length - 1];
    return {
      kind: 'atom',
      atom: latest.atom,
      residue: latest.residue,
      chainId: latest.chainId,
    };
  }

  if (!selectedObject) {
    return null;
  }

  switch (selectedObject.type) {
    case 'atom':
      return {
        kind: 'atom',
        atom: selectedObject.atom,
        residue: selectedObject.residue,
        chainId: selectedObject.chainId,
      };
    case 'residue':
      return {
        kind: 'residue',
        residue: selectedObject.residue,
        chainId: selectedObject.chainId,
      };
    case 'ligand':
      return {
        kind: 'ligand',
        residue: selectedObject.residue,
        chainId: selectedObject.chainId,
      };
    default:
      return null;
  }
}

export function buildInteractionQuery(
  model: StructureModel,
  selectedObject: SelectedObject | null,
  atomSelections: AtomSelection[],
  radiusAngstrom?: number,
): InteractionQuery | null {
  const selection = selectionToInteractionSelection(selectedObject, atomSelections);
  if (!selection) {
    return null;
  }

  return {
    model,
    selection,
    radiusAngstrom,
  };
}
