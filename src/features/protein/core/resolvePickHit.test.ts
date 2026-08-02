import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as THREE from 'three';
import { buildPickIndex } from './buildPickIndex';
import { parseStructureModel } from '../parsers/parseStructureModel';
import { HEMOGLOBIN_PDB_SNIPPET } from '../parsers/parseStructureModel.fixtures';
import { resolvePickHit } from './resolvePickHit';

describe('resolvePickHit', () => {
  it('resolves instanced ligand atoms to atom selections', () => {
    const model = parseStructureModel(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const pickIndex = buildPickIndex(model);
    const structureRoot = new THREE.Group();

    const ref = pickIndex.ligandInstances[0];
    assert.ok(ref);

    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial(),
      pickIndex.ligandInstances.length,
    );
    mesh.name = 'atoms';
    const ligands = new THREE.Group();
    ligands.name = 'ligands';
    ligands.add(mesh);
    structureRoot.add(ligands);

    const intersection: THREE.Intersection = {
      distance: 1,
      point: new THREE.Vector3(),
      object: mesh,
      instanceId: 0,
    };

    const selection = resolvePickHit(intersection, pickIndex, structureRoot);
    assert.equal(selection?.type, 'atom');
    if (selection?.type === 'atom') {
      assert.equal(selection.atom, ref.atom);
      assert.equal(selection.residue, ref.residue);
      assert.equal(selection.chainId, ref.chainId);
    }
  });

  it('promotes ligand atom hits to ligand selection when requested', () => {
    const model = parseStructureModel(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const pickIndex = buildPickIndex(model);
    const structureRoot = new THREE.Group();
    const mesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial(),
      pickIndex.ligandInstances.length,
    );
    mesh.name = 'atoms';
    const ligands = new THREE.Group();
    ligands.name = 'ligands';
    ligands.add(mesh);
    structureRoot.add(ligands);

    const intersection: THREE.Intersection = {
      distance: 1,
      point: new THREE.Vector3(),
      object: mesh,
      instanceId: 0,
    };

    const selection = resolvePickHit(intersection, pickIndex, structureRoot, {
      promoteToLigand: true,
    });
    assert.equal(selection?.type, 'ligand');
  });

  it('resolves cartoon mesh hits to residue selections', () => {
    const model = parseStructureModel(HEMOGLOBIN_PDB_SNIPPET, 'pdb');
    const pickIndex = buildPickIndex(model);
    const structureRoot = new THREE.Group();
    const cartoon = new THREE.Group();
    cartoon.name = 'cartoon';
    structureRoot.add(cartoon);

    const [meshName, entry] = [...pickIndex.cartoonByMeshName.entries()][0];
    assert.ok(entry);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(),
    );
    mesh.name = meshName;
    cartoon.add(mesh);

    const ca = entry.caResiduePairs[0].ca;
    const intersection: THREE.Intersection = {
      distance: 1,
      point: structureRoot.localToWorld(new THREE.Vector3(ca.x, ca.y, ca.z)),
      object: mesh,
    };

    const selection = resolvePickHit(intersection, pickIndex, structureRoot);
    assert.equal(selection?.type, 'residue');
    if (selection?.type === 'residue') {
      assert.equal(selection.residue, entry.caResiduePairs[0].residue);
    }
  });
});
