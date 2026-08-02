import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as THREE from 'three';
import { buildProteinGroup } from './buildProteinGroup';
import {
  HEMOGLOBIN_PDB_SNIPPET,
  MMCIF_FALLBACK_SNIPPET,
  MULTI_CHAIN_PDB_SNIPPET,
} from '../parsers/parseStructureModel.fixtures';

function getChildGroup(group: THREE.Group, name: string): THREE.Group {
  const child = group.getObjectByName(name);
  if (!(child instanceof THREE.Group)) {
    assert.fail(`Expected child group "${name}"`);
  }
  return child;
}

describe('buildProteinGroup', () => {
  it('builds cartoon, ligands, and hidden polymer-atoms for 1HHO-style PDB', () => {
    const group = buildProteinGroup(HEMOGLOBIN_PDB_SNIPPET, 'pdb');

    const cartoon = getChildGroup(group, 'cartoon');
    const ligands = getChildGroup(group, 'ligands');
    const polymerAtoms = getChildGroup(group, 'polymer-atoms');

    assert.equal(cartoon.visible, true);
    assert.equal(polymerAtoms.visible, false);
    assert.ok(cartoon.children.some((child) => child.name.startsWith('chain-A-')));
    assert.ok(ligands.getObjectByName('atoms'));
  });

  it('builds separate cartoon tubes for multi-chain PDB', () => {
    const group = buildProteinGroup(MULTI_CHAIN_PDB_SNIPPET, 'pdb');
    const cartoon = getChildGroup(group, 'cartoon');

    const chainPrefixes = new Set(
      cartoon.children.map((child) => child.name.split('-').slice(0, 2).join('-')),
    );
    assert.ok(chainPrefixes.has('chain-A'));
    assert.ok(chainPrefixes.has('chain-B'));
  });

  it('builds cartoon and ligand atoms for mmCIF fallback', () => {
    const group = buildProteinGroup(MMCIF_FALLBACK_SNIPPET, 'mmcif');

    const cartoon = getChildGroup(group, 'cartoon');
    const ligands = getChildGroup(group, 'ligands');
    const polymerAtoms = getChildGroup(group, 'polymer-atoms');

    assert.ok(cartoon.children.length >= 1);
    assert.ok(ligands.getObjectByName('atoms'));
    assert.equal(polymerAtoms.visible, false);
  });
});
