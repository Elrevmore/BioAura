import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as THREE from 'three';
import { applyRepresentationVisibility } from './applyRepresentationVisibility';
import { buildProteinGroup } from './buildProteinGroup';
import { DEFAULT_PROTEIN_REPRESENTATION } from '../types/representation.types';
import { HEMOGLOBIN_PDB_SNIPPET } from '../parsers/parseStructureModel.fixtures';

function getChildGroup(group: THREE.Group, name: string): THREE.Group {
  const child = group.getObjectByName(name);
  if (!(child instanceof THREE.Group)) {
    assert.fail(`Expected child group "${name}"`);
  }
  return child;
}

describe('applyRepresentationVisibility', () => {
  it('applies default visibility to built protein groups', () => {
    const group = buildProteinGroup(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    applyRepresentationVisibility(group, DEFAULT_PROTEIN_REPRESENTATION);

    assert.equal(getChildGroup(group, 'cartoon').visible, true);
    assert.equal(getChildGroup(group, 'ligands').visible, true);
    assert.equal(getChildGroup(group, 'polymer-atoms').visible, false);
  });

  it('toggles cartoon visibility without rebuilding geometry', () => {
    const group = buildProteinGroup(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const cartoon = getChildGroup(group, 'cartoon');
    const childCountBefore = cartoon.children.length;

    applyRepresentationVisibility(group, {
      ...DEFAULT_PROTEIN_REPRESENTATION,
      cartoon: false,
    });

    assert.equal(cartoon.visible, false);
    assert.equal(cartoon.children.length, childCountBefore);
  });

  it('toggles ligands visibility', () => {
    const group = buildProteinGroup(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const ligands = getChildGroup(group, 'ligands');

    applyRepresentationVisibility(group, {
      ...DEFAULT_PROTEIN_REPRESENTATION,
      ligands: false,
    });

    assert.equal(ligands.visible, false);
  });

  it('toggles polymer-atoms visibility', () => {
    const group = buildProteinGroup(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const polymerAtoms = getChildGroup(group, 'polymer-atoms');

    applyRepresentationVisibility(group, {
      ...DEFAULT_PROTEIN_REPRESENTATION,
      'polymer-atoms': true,
    });

    assert.equal(polymerAtoms.visible, true);
  });

  it('allows multiple layers to be visible simultaneously', () => {
    const group = buildProteinGroup(HEMOGLOBIN_PDB_SNIPPET, 'pdb');

    applyRepresentationVisibility(group, {
      cartoon: true,
      ligands: true,
      'polymer-atoms': true,
    });

    assert.equal(getChildGroup(group, 'cartoon').visible, true);
    assert.equal(getChildGroup(group, 'ligands').visible, true);
    assert.equal(getChildGroup(group, 'polymer-atoms').visible, true);
  });

  it('preserves parent group transform when toggling child visibility', () => {
    const group = buildProteinGroup(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    group.position.set(1, 2, 3);
    group.rotation.set(0.1, 0.2, 0.3);
    group.scale.setScalar(2);

    applyRepresentationVisibility(group, {
      cartoon: false,
      ligands: true,
      'polymer-atoms': true,
    });

    assert.deepEqual(group.position.toArray(), [1, 2, 3]);
    assert.deepEqual(group.rotation.toArray().slice(0, 3), [0.1, 0.2, 0.3]);
    assert.equal(group.scale.x, 2);
  });
});
