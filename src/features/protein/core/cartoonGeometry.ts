import * as THREE from 'three';
import type { StructureAtom } from '../types/structure-model.types';

/** Smooth coil backbone tube — thinner and less emphasized. */
export const TUBE_RADIUS = 0.38;
export const TUBE_RADIAL_SEGMENTS = 8;
/** Flat α-helix ribbon width in Ångströms (PDB coordinate units). */
export const HELIX_RIBBON_WIDTH = 1.6;
/** α-helix pitch in Ångströms (PDB coordinate units). */
export const ALPHA_HELIX_PITCH_ANGSTROM = 5.4;

export const SHEET_WIDTH = 1.55;
export const SHEET_ARROW_LENGTH = 1.15;
/** Minimum CA count before drawing a sheet arrow head. */
export const SHEET_MIN_ARROW_POINTS = 4;

export interface CurveFrame {
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  binormal: THREE.Vector3;
}

const _fallbackAxis = new THREE.Vector3(1, 0, 0);
const _rotationAxis = new THREE.Vector3();
const _tempNormal = new THREE.Vector3();
const _tempBinormal = new THREE.Vector3();
const _tempTangent = new THREE.Vector3();

const REFERENCE_AXES = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 0),
];

export function caAtomsToPoints(atoms: StructureAtom[]): THREE.Vector3[] {
  return atoms.map((atom) => new THREE.Vector3(atom.x, atom.y, atom.z));
}

/**
 * Picks a unit vector perpendicular to tangent using cascading reference axes.
 */
export function computeStablePerpendicular(tangent: THREE.Vector3, target: THREE.Vector3): void {
  _tempTangent.copy(tangent).normalize();

  for (const reference of REFERENCE_AXES) {
    target.crossVectors(reference, _tempTangent);
    if (target.lengthSq() > 1e-4) {
      target.normalize();
      return;
    }

    target.crossVectors(_tempTangent, reference);
    if (target.lengthSq() > 1e-4) {
      target.normalize();
      return;
    }
  }

  target.copy(_fallbackAxis);
}

function pickInitialNormal(tangent: THREE.Vector3, target: THREE.Vector3): void {
  computeStablePerpendicular(tangent, target);
}

/**
 * Parallel-transport frames along a curve for stable normals in arbitrary orientations.
 */
export function computeParallelTransportFrames(
  curve: THREE.CatmullRomCurve3,
  segments: number,
): CurveFrame[] {
  const frames: CurveFrame[] = [];
  const tangent = new THREE.Vector3();

  curve.getTangent(0, tangent).normalize();
  pickInitialNormal(tangent, _tempNormal);
  _tempBinormal.crossVectors(tangent, _tempNormal).normalize();
  _tempNormal.crossVectors(_tempBinormal, tangent).normalize();

  frames.push({
    tangent: tangent.clone(),
    normal: _tempNormal.clone(),
    binormal: _tempBinormal.clone(),
  });

  for (let i = 1; i <= segments; i++) {
    const previous = frames[i - 1];
    curve.getTangent(i / segments, tangent).normalize();

    _rotationAxis.crossVectors(previous.tangent, tangent);
    const alignment = Math.max(-1, Math.min(1, previous.tangent.dot(tangent)));
    const angle = Math.acos(alignment);

    _tempNormal.copy(previous.normal);
    _tempBinormal.copy(previous.binormal);

    if (_rotationAxis.lengthSq() > 1e-8 && angle > 1e-8) {
      _rotationAxis.normalize();
      _tempNormal.applyAxisAngle(_rotationAxis, angle);
      _tempBinormal.crossVectors(tangent, _tempNormal).normalize();
      _tempNormal.crossVectors(_tempBinormal, tangent).normalize();
    }

    frames.push({
      tangent: tangent.clone(),
      normal: _tempNormal.clone(),
      binormal: _tempBinormal.clone(),
    });
  }

  return frames;
}

function computeCurveArcLengths(curve: THREE.CatmullRomCurve3, segments: number): number[] {
  const arcLengths: number[] = [0];
  let totalArcLength = 0;
  const previousPoint = new THREE.Vector3();
  curve.getPoint(0, previousPoint);

  for (let i = 1; i <= segments; i++) {
    const currentPoint = curve.getPoint(i / segments);
    totalArcLength += previousPoint.distanceTo(currentPoint);
    arcLengths.push(totalArcLength);
    previousPoint.copy(currentPoint);
  }

  return arcLengths;
}

/**
 * Parallel-transport frames along discrete CA points (used by sheet ribbons).
 */
export function computePointTransportFrames(points: THREE.Vector3[]): CurveFrame[] {
  if (points.length < 2) {
    return [];
  }

  const frames: CurveFrame[] = [];
  const tangent = new THREE.Vector3();

  tangent.subVectors(points[1], points[0]).normalize();
  pickInitialNormal(tangent, _tempNormal);
  _tempBinormal.crossVectors(tangent, _tempNormal).normalize();
  _tempNormal.crossVectors(_tempBinormal, tangent).normalize();

  frames.push({
    tangent: tangent.clone(),
    normal: _tempNormal.clone(),
    binormal: _tempBinormal.clone(),
  });

  for (let i = 1; i < points.length; i++) {
    const previous = frames[i - 1];

    if (i < points.length - 1) {
      tangent.subVectors(points[i + 1], points[i - 1]);
    } else {
      tangent.subVectors(points[i], points[i - 1]);
    }

    if (tangent.lengthSq() === 0) {
      frames.push({
        tangent: previous.tangent.clone(),
        normal: previous.normal.clone(),
        binormal: previous.binormal.clone(),
      });
      continue;
    }

    tangent.normalize();
    _rotationAxis.crossVectors(previous.tangent, tangent);
    const alignment = Math.max(-1, Math.min(1, previous.tangent.dot(tangent)));
    const angle = Math.acos(alignment);

    _tempNormal.copy(previous.normal);
    _tempBinormal.copy(previous.binormal);

    if (_rotationAxis.lengthSq() > 1e-8 && angle > 1e-8) {
      _rotationAxis.normalize();
      _tempNormal.applyAxisAngle(_rotationAxis, angle);
      _tempBinormal.crossVectors(tangent, _tempNormal).normalize();
      _tempNormal.crossVectors(_tempBinormal, tangent).normalize();
    }

    frames.push({
      tangent: tangent.clone(),
      normal: _tempNormal.clone(),
      binormal: _tempBinormal.clone(),
    });
  }

  return frames;
}

export function buildTubeGeometry(
  points: THREE.Vector3[],
  radius: number,
): THREE.TubeGeometry | null {
  if (points.length < 2) {
    return null;
  }

  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35);
  const tubularSegments = Math.max(16, points.length * 6);

  return new THREE.TubeGeometry(
    curve,
    tubularSegments,
    radius,
    TUBE_RADIAL_SEGMENTS,
    false,
  );
}

function buildOrientedRibbonQuad(
  center: THREE.Vector3,
  tangent: THREE.Vector3,
  width: number,
): THREE.BufferGeometry {
  const halfWidth = width / 2;
  const normalizedTangent =
    tangent.lengthSq() > 0 ? tangent.clone().normalize() : new THREE.Vector3(1, 0, 0);
  const side = new THREE.Vector3();
  computeStablePerpendicular(normalizedTangent, side);
  const depth = new THREE.Vector3()
    .crossVectors(normalizedTangent, side)
    .normalize()
    .multiplyScalar(halfWidth * 0.25);

  const edgeA = center.clone().addScaledVector(side, halfWidth).add(depth);
  const edgeB = center.clone().addScaledVector(side, -halfWidth).add(depth);
  const edgeC = center.clone().addScaledVector(side, -halfWidth).sub(depth);
  const edgeD = center.clone().addScaledVector(side, halfWidth).sub(depth);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      [
        edgeA.x, edgeA.y, edgeA.z,
        edgeB.x, edgeB.y, edgeB.z,
        edgeC.x, edgeC.y, edgeC.z,
        edgeD.x, edgeD.y, edgeD.z,
      ],
      3,
    ),
  );
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Builds a flat helical ribbon coiled around the CA trace (cartoon α-helix style).
 * The ribbon midpoint follows the backbone; width rotates with α-helix pitch.
 */
export function buildHelixGeometry(points: THREE.Vector3[]): THREE.BufferGeometry | null {
  if (points.length === 1) {
    return buildOrientedRibbonQuad(points[0], new THREE.Vector3(1, 0, 0), HELIX_RIBBON_WIDTH);
  }

  if (points.length < 2) {
    return null;
  }

  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35);
  const ribbonSegments = Math.max(24, points.length * 8);
  const frames = computeParallelTransportFrames(curve, ribbonSegments);
  const arcLengths = computeCurveArcLengths(curve, ribbonSegments);
  const halfWidth = HELIX_RIBBON_WIDTH / 2;

  const positions: number[] = [];
  const indices: number[] = [];
  const backboneCenter = new THREE.Vector3();
  const widthDirection = new THREE.Vector3();
  const edgeA = new THREE.Vector3();
  const edgeB = new THREE.Vector3();

  for (let i = 0; i <= ribbonSegments; i++) {
    const frame = frames[i];
    backboneCenter.copy(curve.getPoint(i / ribbonSegments));

    const phase = (arcLengths[i] / ALPHA_HELIX_PITCH_ANGSTROM) * Math.PI * 2;
    widthDirection
      .copy(frame.normal)
      .multiplyScalar(Math.cos(phase))
      .addScaledVector(frame.binormal, Math.sin(phase));

    edgeA.copy(backboneCenter).addScaledVector(widthDirection, halfWidth);
    edgeB.copy(backboneCenter).addScaledVector(widthDirection, -halfWidth);
    positions.push(edgeA.x, edgeA.y, edgeA.z, edgeB.x, edgeB.y, edgeB.z);

    if (i > 0) {
      const base = (i - 1) * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Measures how far helix ribbon vertices deviate from the underlying CA spline (Ångströms).
 */
export function measureHelixRibbonDeviation(points: THREE.Vector3[]): {
  maxOffsetAngstrom: number;
  meanOffsetAngstrom: number;
  sampleRibbonWidthAngstrom: number;
} {
  if (points.length < 2) {
    return { maxOffsetAngstrom: 0, meanOffsetAngstrom: 0, sampleRibbonWidthAngstrom: 0 };
  }

  const geometry = buildHelixGeometry(points);
  if (!geometry) {
    return { maxOffsetAngstrom: 0, meanOffsetAngstrom: 0, sampleRibbonWidthAngstrom: 0 };
  }

  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35);
  const position = geometry.attributes.position;
  const center = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  let maxOffset = 0;
  let meanOffset = 0;

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    let bestDistance = Infinity;

    for (let step = 0; step <= 80; step++) {
      center.copy(curve.getPoint(step / 80));
      bestDistance = Math.min(bestDistance, vertex.distanceTo(center));
    }

    maxOffset = Math.max(maxOffset, bestDistance);
    meanOffset += bestDistance;
  }

  const midIndex = Math.floor(position.count / 4) * 2;
  const widthSample = new THREE.Vector3().fromBufferAttribute(position, midIndex)
    .distanceTo(new THREE.Vector3().fromBufferAttribute(position, midIndex + 1));

  return {
    maxOffsetAngstrom: maxOffset,
    meanOffsetAngstrom: meanOffset / position.count,
    sampleRibbonWidthAngstrom: widthSample,
  };
}

/**
 * Builds a flat ribbon with a terminal arrow for beta-sheet segments.
 * Width is applied along the transported binormal for view-stable framing.
 */
export function buildSheetRibbonGeometry(points: THREE.Vector3[]): THREE.BufferGeometry | null {
  if (points.length === 1) {
    return buildOrientedRibbonQuad(points[0], new THREE.Vector3(1, 0, 0), SHEET_WIDTH);
  }

  if (points.length < 2) {
    return null;
  }

  const positions: number[] = [];
  const indices: number[] = [];
  const halfWidth = SHEET_WIDTH / 2;
  const frames = computePointTransportFrames(points);
  const left = new THREE.Vector3();
  const right = new THREE.Vector3();

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const side = frames[i]?.binormal ?? _fallbackAxis;

    left.copy(point).addScaledVector(side, halfWidth);
    right.copy(point).addScaledVector(side, -halfWidth);
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);

    if (i > 0) {
      const base = (i - 1) * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }

  if (points.length >= SHEET_MIN_ARROW_POINTS) {
    const tip = points[points.length - 1];
    const prev = points[points.length - 2];
    const direction = tip.clone().sub(prev).normalize();
    const tipFrame = frames[frames.length - 1];
    const side = tipFrame?.binormal ?? _fallbackAxis;

    const arrowBaseCenter = tip.clone().addScaledVector(direction, -SHEET_ARROW_LENGTH * 0.65);
    const arrowLeft = arrowBaseCenter.clone().addScaledVector(side, halfWidth * 1.35);
    const arrowRight = arrowBaseCenter.clone().addScaledVector(side, -halfWidth * 1.35);
    const arrowTip = tip.clone().addScaledVector(direction, SHEET_ARROW_LENGTH * 0.45);

    const arrowBase = positions.length / 3;
    positions.push(
      arrowLeft.x, arrowLeft.y, arrowLeft.z,
      arrowRight.x, arrowRight.y, arrowRight.z,
      arrowTip.x, arrowTip.y, arrowTip.z,
    );

    const lastRibbonVertex = (points.length - 1) * 2;
    indices.push(lastRibbonVertex, lastRibbonVertex + 1, arrowBase + 2);
    indices.push(arrowBase, arrowBase + 2, arrowBase + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Samples the apparent ribbon width near the midpoint of a sheet geometry.
 */
export function measureSheetRibbonWidth(points: THREE.Vector3[]): number {
  const geometry = buildSheetRibbonGeometry(points);
  if (!geometry || geometry.attributes.position.count < 2) {
    return 0;
  }

  const position = geometry.attributes.position;
  const midPair = Math.max(0, Math.floor(points.length / 2) - 1) * 2;
  const left = new THREE.Vector3().fromBufferAttribute(position, midPair);
  const right = new THREE.Vector3().fromBufferAttribute(position, midPair + 1);
  return left.distanceTo(right);
}
