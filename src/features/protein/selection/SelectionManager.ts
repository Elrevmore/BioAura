import type { AtomSelection, SelectedObject, SelectionState } from '../types/selection.types';
import { MAX_ATOM_SELECTIONS } from '../types/selection.types';

type SelectionListener = (state: SelectionState) => void;

const EMPTY_STATE: SelectionState = {
  selectionType: 'none',
  selectedObject: null,
  atomSelections: [],
};

function isSameAtomSelection(left: AtomSelection, right: AtomSelection): boolean {
  return (
    left.chainId === right.chainId &&
    left.residue === right.residue &&
    left.atom === right.atom
  );
}

/**
 * Central selection store — shared by mouse picking and future gesture tools.
 * Keeps selection logic out of renderers and UI components.
 */
export class SelectionManager {
  private state: SelectionState = { ...EMPTY_STATE };

  private readonly listeners = new Set<SelectionListener>();

  getState(): SelectionState {
    return this.state;
  }

  subscribe(listener: SelectionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  select(selected: SelectedObject): void {
    if (selected.type === 'atom') {
      this.appendAtomSelection(selected);
      return;
    }

    this.state = {
      selectionType: selected.type,
      selectedObject: selected,
      atomSelections: [],
    };
    this.notify();
  }

  /**
   * Appends an atom to the ordered multi-selection (max {@link MAX_ATOM_SELECTIONS}).
   * Duplicate picks move the atom to the end of the queue.
   */
  appendAtomSelection(atom: AtomSelection): void {
    const withoutDuplicate = this.state.atomSelections.filter(
      (entry) => !isSameAtomSelection(entry, atom),
    );
    let next = [...withoutDuplicate, atom];
    if (next.length > MAX_ATOM_SELECTIONS) {
      next = next.slice(next.length - MAX_ATOM_SELECTIONS);
    }

    this.state = {
      selectionType: 'atom',
      selectedObject: atom,
      atomSelections: next,
    };
    this.notify();
  }

  clearSelection(): void {
    if (
      this.state.selectionType === 'none' &&
      this.state.selectedObject === null &&
      this.state.atomSelections.length === 0
    ) {
      return;
    }
    this.state = { ...EMPTY_STATE };
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
