import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as THREE from 'three';
import {
  ALPHA_HELIX_PITCH_ANGSTROM,
  buildHelixGeometry,
  buildSheetRibbonGeometry,
  buildTubeGeometry,
  HELIX_RIBBON_WIDTH,
  measureHelixRibbonDeviation,
  TUBE_RADIUS,
} from './cartoonGeometry';

const SAMPLE_POINTS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(3.8, 0, 0),
  new THREE.Vector3(7.6, 1.5, 0),
  new THREE.Vector3(11.4, 1.5, 1.5),
  new THREE.Vector3(15.2, 3, 1.5),
  new THREE.Vector3(19, 3, 3),
  new THREE.Vector3(22.8, 4.5, 3),
  new THREE.Vector3(26.6, 4.5, 4.5),
  new THREE.Vector3(30.4, 6, 4.5),
  new THREE.Vector3(34.2, 6, 6),
];

function boundingBoxSize(geometry: THREE.BufferGeometry): THREE.Vector3 {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  assert.ok(box);
  return box.getSize(new THREE.Vector3());
}

describe('cartoonGeometry', () => {
  it('builds coil geometry from TubeGeometry unchanged', () => {
    const geometry = buildTubeGeometry(SAMPLE_POINTS, TUBE_RADIUS);

    assert.ok(geometry instanceof THREE.TubeGeometry);
    assert.ok(geometry.attributes.position.count > 0);
  });

  it('builds helix as a flat ribbon strip rather than a round tube', () => {
    const geometry = buildHelixGeometry(SAMPLE_POINTS);

    assert.ok(geometry);
    assert.ok(!(geometry instanceof THREE.TubeGeometry));
    assert.ok(geometry.index && geometry.index.count > 0);
    assert.equal(geometry.attributes.position.count % 2, 0);
    assert.ok(geometry.attributes.position.count >= SAMPLE_POINTS.length * 2);
  });

  it('keeps helix ribbon vertices within bounded deviation of the CA trace', () => {
    const deviation = measureHelixRibbonDeviation(SAMPLE_POINTS);
    const halfWidth = HELIX_RIBBON_WIDTH / 2;

    assert.ok(deviation.maxOffsetAngstrom <= halfWidth + 0.05);
    assert.ok(deviation.meanOffsetAngstrom <= halfWidth + 0.05);
  });

  it('applies visible helix ribbon width and α-helix pitch period', () => {
    assert.equal(ALPHA_HELIX_PITCH_ANGSTROM, 5.4);

    const deviation = measureHelixRibbonDeviation(SAMPLE_POINTS);
    assert.ok(Math.abs(deviation.sampleRibbonWidthAngstrom - HELIX_RIBBON_WIDTH) < 0.05);
  });

  it('produces a broader bounding volume for helix ribbon than coil tube', () => {
    const coil = buildTubeGeometry(SAMPLE_POINTS, TUBE_RADIUS)!;
    const helix = buildHelixGeometry(SAMPLE_POINTS)!;

    const coilSize = boundingBoxSize(coil);
    const helixSize = boundingBoxSize(helix);

    assert.ok(helixSize.length() > coilSize.length());
  });

  it('builds sheet ribbon geometry with indexed faces', () => {
    const geometry = buildSheetRibbonGeometry(SAMPLE_POINTS);

    assert.ok(geometry);
    assert.ok(geometry.index && geometry.index.count > 0);
    assert.ok(geometry.attributes.position.count >= SAMPLE_POINTS.length * 2);
  });
});
