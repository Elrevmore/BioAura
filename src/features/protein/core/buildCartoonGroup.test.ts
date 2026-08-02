import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as THREE from 'three';
import { buildCartoonGroup } from './buildCartoonGroup';
import { buildCartoonSegments } from './cartoonSegments';
import { annotateSecondaryStructure } from '../parsers/annotateSecondaryStructure';
import { parseStructureModel } from '../parsers/parseStructureModel';
import { SSE_PDB_SNIPPET } from '../parsers/parseStructureModel.fixtures';

describe('buildCartoonGroup secondary-structure segments', () => {
  it('groups contiguous helix, sheet, and coil segments per chain', () => {
    const model = parseStructureModel(SSE_PDB_SNIPPET, 'pdb');
    annotateSecondaryStructure(model, SSE_PDB_SNIPPET);

    const segments = buildCartoonSegments(model);
    const types = segments.map((segment) => `${segment.chainId}:${segment.type}`);

    assert.ok(types.includes('A:coil'));
    assert.ok(types.includes('A:helix'));
    assert.ok(types.includes('B:sheet'));
    assert.ok(segments.every((segment) => segment.caAtoms.length >= 2));
  });

  it('renders separate meshes per contiguous segment', () => {
    const model = parseStructureModel(SSE_PDB_SNIPPET, 'pdb');
    annotateSecondaryStructure(model, SSE_PDB_SNIPPET);

    const cartoon = buildCartoonGroup(model);
    const names = cartoon.children.map((child) => child.name);

    assert.ok(names.some((name) => name.startsWith('chain-A-helix-')));
    assert.ok(names.some((name) => name.startsWith('chain-A-coil-')));
    assert.ok(names.some((name) => name.startsWith('chain-B-sheet-')));
  });

  it('uses distinct geometry types for helix, coil, and sheet segments', () => {
    const model = parseStructureModel(SSE_PDB_SNIPPET, 'pdb');
    annotateSecondaryStructure(model, SSE_PDB_SNIPPET);

    const cartoon = buildCartoonGroup(model);
    const helixMesh = cartoon.children.find((child) => child.name.startsWith('chain-A-helix-'));
    const coilMesh = cartoon.children.find((child) => child.name.startsWith('chain-A-coil-'));
    const sheetMesh = cartoon.children.find((child) => child.name.startsWith('chain-B-sheet-'));

    assert.ok(helixMesh instanceof THREE.Mesh);
    assert.ok(coilMesh instanceof THREE.Mesh);
    assert.ok(sheetMesh instanceof THREE.Mesh);
    assert.ok(coilMesh.geometry instanceof THREE.TubeGeometry);
    assert.ok(!(helixMesh.geometry instanceof THREE.TubeGeometry));
    assert.ok(!(sheetMesh.geometry instanceof THREE.TubeGeometry));
  });
});
