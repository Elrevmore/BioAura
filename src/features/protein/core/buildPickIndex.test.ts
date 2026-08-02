import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as THREE from 'three';
import { buildLigandGroup } from './buildLigandGroup';
import { buildPickIndex } from './buildPickIndex';
import { buildPolymerAtomGroup } from './buildPolymerAtomGroup';
import { parseStructureModel } from '../parsers/parseStructureModel';
import { HEMOGLOBIN_PDB_SNIPPET } from '../parsers/parseStructureModel.fixtures';

describe('buildPickIndex', () => {
  it('mirrors ligand and polymer instanced atom ordering', () => {
    const model = parseStructureModel(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const pickIndex = buildPickIndex(model);

    const ligandGroup = buildLigandGroup(model);
    const ligandMesh = ligandGroup.getObjectByName('atoms');
    assert.ok(ligandMesh instanceof THREE.InstancedMesh);
    assert.equal(pickIndex.ligandInstances.length, ligandMesh.count);

    const polymerGroup = buildPolymerAtomGroup(model);
    const polymerMesh = polymerGroup.getObjectByName('atoms');
    assert.ok(polymerMesh instanceof THREE.InstancedMesh);
    assert.equal(pickIndex.polymerInstances.length, polymerMesh.count);
  });

  it('indexes cartoon meshes by segment name', () => {
    const model = parseStructureModel(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const pickIndex = buildPickIndex(model);

    assert.ok(pickIndex.cartoonByMeshName.size > 0);
    for (const [meshName, entry] of pickIndex.cartoonByMeshName) {
      assert.match(meshName, /^chain-.+-(helix|sheet|coil)-\d+$/);
      assert.equal(entry.chainId, meshName.split('-')[1]);
      assert.ok(entry.caResiduePairs.length > 0);
    }
  });
});
