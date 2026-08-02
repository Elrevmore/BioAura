import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import {
  applySelectionHighlight,
  clearSelectionHighlight,
  createHighlightSnapshot,
} from '../core/applySelectionHighlight';
import { useProtein } from '../hooks/useProtein';
import { useSelection } from '../hooks/useSelection';
import { useStructureModel } from '../hooks/useStructureModel';

const PROTEIN_STRUCTURE_NAME = 'protein-structure';

/**
 * Synchronizes selection state with lightweight material / instance-color highlights.
 */
export function ProteinHighlight() {
  const { scene } = useThree();
  const { status } = useProtein();
  const structureModel = useStructureModel();
  const { selectedObject, atomSelections } = useSelection();
  const snapshotRef = useRef(createHighlightSnapshot());

  useEffect(() => {
    if (status !== 'loaded' || !structureModel) {
      clearSelectionHighlight(snapshotRef.current);
      return;
    }

    const structureRoot = scene.getObjectByName(PROTEIN_STRUCTURE_NAME);
    if (!structureRoot) {
      clearSelectionHighlight(snapshotRef.current);
      return;
    }

    applySelectionHighlight(
      selectedObject,
      structureModel.pickIndex,
      structureRoot,
      snapshotRef.current,
      atomSelections,
    );

    const snapshot = snapshotRef.current;
    return () => {
      clearSelectionHighlight(snapshot);
    };
  }, [atomSelections, scene, selectedObject, status, structureModel]);

  return null;
}
