import { createContext } from 'react';
import type { SelectionManager } from '../selection/SelectionManager';
import type { AtomSelection, SelectedObject, SelectionState } from '../types/selection.types';

export interface SelectionContextValue extends SelectionState {
  select: (selected: SelectedObject) => void;
  appendAtomSelection: (atom: AtomSelection) => void;
  clearSelection: () => void;
  manager: SelectionManager;
}

export const SelectionContext = createContext<SelectionContextValue | null>(null);
