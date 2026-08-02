import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SelectionManager } from '../selection/SelectionManager';
import type { AtomSelection } from '../types/selection.types';

describe('SelectionManager', () => {
  it('tracks selection type and supports clearing', () => {
    const manager = new SelectionManager();
    const atomSelection: AtomSelection = {
      type: 'atom',
      chainId: 'A',
      residue: {
        name: 'ALA',
        seqId: '1',
        seqNumber: 1,
        recordGroup: 'ATOM',
        isPolymer: true,
        atoms: [
          {
            name: 'CA',
            element: 'C',
            x: 0,
            y: 0,
            z: 0,
            recordGroup: 'ATOM',
            isPolymer: true,
          },
        ],
      },
      atom: {
        name: 'CA',
        element: 'C',
        x: 0,
        y: 0,
        z: 0,
        recordGroup: 'ATOM',
        isPolymer: true,
      },
    };

    manager.select(atomSelection);
    assert.equal(manager.getState().selectionType, 'atom');
    assert.equal(manager.getState().selectedObject, atomSelection);
    assert.equal(manager.getState().atomSelections.length, 1);
    assert.equal(manager.getState().atomSelections[0], atomSelection);

    manager.clearSelection();
    assert.equal(manager.getState().selectionType, 'none');
    assert.equal(manager.getState().selectedObject, null);
    assert.equal(manager.getState().atomSelections.length, 0);
  });

  it('appends ordered atom selections up to the maximum', () => {
    const manager = new SelectionManager();
    const makeAtom = (name: string, x: number): AtomSelection => ({
      type: 'atom',
      chainId: 'A',
      residue: {
        name: 'ALA',
        seqId: '1',
        seqNumber: 1,
        recordGroup: 'ATOM',
        isPolymer: true,
        atoms: [
          {
            name,
            element: 'C',
            x,
            y: 0,
            z: 0,
            recordGroup: 'ATOM',
            isPolymer: true,
          },
        ],
      },
      atom: {
        name,
        element: 'C',
        x,
        y: 0,
        z: 0,
        recordGroup: 'ATOM',
        isPolymer: true,
      },
    });

    const atoms = [
      makeAtom('CA', 0),
      makeAtom('CB', 1),
      makeAtom('CG', 2),
      makeAtom('CD', 3),
      makeAtom('CE', 4),
    ];

    for (const atom of atoms) {
      manager.select(atom);
    }

    assert.equal(manager.getState().atomSelections.length, 4);
    assert.equal(manager.getState().atomSelections[0].atom.name, 'CB');
    assert.equal(manager.getState().atomSelections[3].atom.name, 'CE');
  });

  it('clears atom selections when selecting a non-atom object', () => {
    const manager = new SelectionManager();
    manager.select({
      type: 'atom',
      chainId: 'A',
      residue: {
        name: 'ALA',
        seqId: '1',
        seqNumber: 1,
        recordGroup: 'ATOM',
        isPolymer: true,
        atoms: [],
      },
      atom: {
        name: 'CA',
        element: 'C',
        x: 0,
        y: 0,
        z: 0,
        recordGroup: 'ATOM',
        isPolymer: true,
      },
    });

    manager.select({
      type: 'chain',
      chain: { chainId: 'A', residues: [] },
    });

    assert.equal(manager.getState().atomSelections.length, 0);
    assert.equal(manager.getState().selectionType, 'chain');
  });

  it('notifies subscribers on updates', () => {
    const manager = new SelectionManager();
    let notifications = 0;
    const unsubscribe = manager.subscribe(() => {
      notifications += 1;
    });

    manager.clearSelection();
    assert.equal(notifications, 0);

    manager.select({
      type: 'chain',
      chain: { chainId: 'A', residues: [] },
    });
    assert.equal(notifications, 1);

    manager.clearSelection();
    assert.equal(notifications, 2);
    unsubscribe();
  });
});
