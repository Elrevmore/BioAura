import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as THREE from 'three';
import {
  computeStablePerpendicular,
  measureSheetRibbonWidth,
  SHEET_WIDTH,
  buildSheetRibbonGeometry,
  buildTubeGeometry,
  caAtomsToPoints,
  TUBE_RADIUS,
} from './cartoonGeometry';
import { prepareSegmentRenderPoints } from './cartoonSegmentConnectivity';
import { buildCartoonSegments } from './cartoonSegments';
import type { StructureAtom, StructureModel } from '../types/structure-model.types';

function makeCaAtom(x: number, y: number, z: number): StructureAtom {
  return {
    name: 'CA',
    element: 'C',
    x,
    y,
    z,
    recordGroup: 'ATOM',
    isPolymer: true,
  };
}

function nearestVertexDistanceToPoint(
  geometry: THREE.BufferGeometry,
  target: THREE.Vector3,
): number {
  const position = geometry.attributes.position;
  let best = Infinity;

  for (let i = 0; i < position.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(position, i);
    best = Math.min(best, vertex.distanceTo(target));
  }

  return best;
}

describe('cartoonGeometry phase 3.2', () => {
  it('computes a stable perpendicular when tangent is parallel to the primary reference axis', () => {
    const tangent = new THREE.Vector3(0, 1, 0);
    const perpendicular = new THREE.Vector3();
    computeStablePerpendicular(tangent, perpendicular);

    assert.ok(Math.abs(perpendicular.dot(tangent)) < 1e-4);
    assert.ok(Math.abs(perpendicular.length() - 1) < 1e-4);
  });

  it('keeps sheet ribbon width non-degenerate for short and axis-aligned strands', () => {
    const shortStrand = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(3.8, 0, 0),
      new THREE.Vector3(7.6, 0, 0),
    ];

    const width = measureSheetRibbonWidth(shortStrand);
    assert.ok(width >= SHEET_WIDTH * 0.9);

    const geometry = buildSheetRibbonGeometry(shortStrand);
    assert.ok(geometry);
    assert.ok(geometry.attributes.position.count >= 6);
  });

  it('extends adjacent segment points without changing the annotated CA core', () => {
    const core = [makeCaAtom(0, 0, 0), makeCaAtom(3.8, 0, 0)];
    const prev = makeCaAtom(-3.8, 0, 0);
    const next = makeCaAtom(7.6, 0, 0);

    const extended = prepareSegmentRenderPoints(core, prev, next);

    assert.equal(extended.length, 4);
    assert.deepEqual(extended[1].toArray(), [0, 0, 0]);
    assert.deepEqual(extended[2].toArray(), [3.8, 0, 0]);
  });

  it('reduces avoidable gaps at segment boundaries using endpoint overlap', () => {
    const left = [makeCaAtom(0, 0, 0), makeCaAtom(3.8, 0, 0)];
    const right = [makeCaAtom(7.6, 0, 0), makeCaAtom(11.4, 0, 0)];
    const sharedBoundary = new THREE.Vector3(3.8, 0, 0);

    const isolated = buildTubeGeometry(caAtomsToPoints(right), TUBE_RADIUS);
    const connected = buildTubeGeometry(
      prepareSegmentRenderPoints(right, left[1], null),
      TUBE_RADIUS,
    );

    assert.ok(isolated && connected);
    const isolatedGap = nearestVertexDistanceToPoint(isolated, sharedBoundary);
    const connectedGap = nearestVertexDistanceToPoint(connected, sharedBoundary);
    assert.ok(connectedGap < isolatedGap);
  });

  it('retains short annotated helix and sheet segments instead of dropping them', () => {
    const model: StructureModel = {
      format: 'pdb',
      chains: [
        {
          chainId: 'A',
          residues: [
            {
              name: 'ALA',
              seqId: '48',
              seqNumber: 48,
              recordGroup: 'ATOM',
              isPolymer: true,
              secondaryStructure: 'sheet',
              atoms: [makeCaAtom(0, 0, 0)],
            },
          ],
        },
      ],
    };

    const segments = buildCartoonSegments(model);
    assert.equal(segments.length, 1);
    assert.equal(segments[0]?.type, 'sheet');
    assert.equal(segments[0]?.caAtoms.length, 1);
  });
});
