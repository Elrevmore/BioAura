import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { SelectionManager } from '../selection/SelectionManager';
import { SelectionContext } from './SelectionContext';
import type { AtomSelection, SelectedObject } from '../types/selection.types';

interface SelectionProviderProps {
  children: ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const managerRef = useRef<SelectionManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new SelectionManager();
  }
  const manager = managerRef.current;

  const state = useSyncExternalStore(
    (listener) => manager.subscribe(listener),
    () => manager.getState(),
    () => manager.getState(),
  );

  const select = useCallback((selected: SelectedObject) => {
    manager.select(selected);
  }, [manager]);

  const appendAtomSelection = useCallback((atom: AtomSelection) => {
    manager.appendAtomSelection(atom);
  }, [manager]);

  const clearSelection = useCallback(() => {
    manager.clearSelection();
  }, [manager]);

  const value = useMemo(
    () => ({
      ...state,
      select,
      appendAtomSelection,
      clearSelection,
      manager,
    }),
    [state, select, appendAtomSelection, clearSelection, manager],
  );

  return (
    <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
  );
}
