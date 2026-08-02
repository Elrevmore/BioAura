import * as THREE from 'three';
import type { StructureModel } from '../types/structure-model.types';
import { chainColorHexForIndex } from './chainColors';
import { prepareSegmentRenderPoints } from './cartoonSegmentConnectivity';
import { buildCartoonSegments, type CartoonSegment } from './cartoonSegments';
import {
  buildHelixGeometry,
  buildSheetRibbonGeometry,
  buildTubeGeometry,
  TUBE_RADIUS,
} from './cartoonGeometry';

function createSegmentMaterial(
  chainIndex: number,
  type: 'coil' | 'helix' | 'sheet',
): THREE.MeshStandardMaterial {
  const baseColor = chainColorHexForIndex(chainIndex);

  const materialByType = {
    coil: { emissiveIntensity: 0.08, metalness: 0.15, roughness: 0.55 },
    helix: { emissiveIntensity: 0.17, metalness: 0.32, roughness: 0.38 },
    sheet: { emissiveIntensity: 0.14, metalness: 0.18, roughness: 0.42 },
  } as const;

  const tuning = materialByType[type];

  return new THREE.MeshStandardMaterial({
    color: baseColor,
    emissive: baseColor,
    emissiveIntensity: tuning.emissiveIntensity,
    metalness: tuning.metalness,
    roughness: tuning.roughness,
    side: type === 'sheet' || type === 'helix' ? THREE.DoubleSide : THREE.FrontSide,
  });
}

function groupSegmentsByChain(segments: CartoonSegment[]): Map<string, CartoonSegment[]> {
  const grouped = new Map<string, CartoonSegment[]>();

  for (const segment of segments) {
    const chainSegments = grouped.get(segment.chainId) ?? [];
    chainSegments.push(segment);
    grouped.set(segment.chainId, chainSegments);
  }

  return grouped;
}

/**
 * Builds secondary-structure-aware cartoon geometry per chain segment.
 */
export function buildCartoonGroup(model: StructureModel): THREE.Group {
  const cartoonGroup = new THREE.Group();
  cartoonGroup.name = 'cartoon';

  const segments = buildCartoonSegments(model);
  const sharedMaterials: THREE.Material[] = [];
  const chainIndexById = new Map<string, number>();
  const segmentsByChain = groupSegmentsByChain(segments);

  for (const segment of segments) {
    if (!chainIndexById.has(segment.chainId)) {
      chainIndexById.set(segment.chainId, chainIndexById.size);
    }

    const chainIndex = chainIndexById.get(segment.chainId) ?? 0;
    const chainSegments = segmentsByChain.get(segment.chainId) ?? [];
    const segmentPosition = chainSegments.indexOf(segment);
    const previousSegment = segmentPosition > 0 ? chainSegments[segmentPosition - 1] : null;
    const nextSegment =
      segmentPosition >= 0 && segmentPosition < chainSegments.length - 1
        ? chainSegments[segmentPosition + 1]
        : null;

    const points = prepareSegmentRenderPoints(
      segment.caAtoms,
      previousSegment?.caAtoms.at(-1) ?? null,
      nextSegment?.caAtoms[0] ?? null,
    );

    let geometry: THREE.BufferGeometry | null = null;
    let segmentKind: 'coil' | 'helix' | 'sheet' = 'coil';

    if (segment.type === 'sheet') {
      geometry = buildSheetRibbonGeometry(points);
      segmentKind = 'sheet';
    } else if (segment.type === 'helix') {
      geometry = buildHelixGeometry(points);
      segmentKind = 'helix';
    } else {
      geometry = buildTubeGeometry(points, TUBE_RADIUS);
      segmentKind = 'coil';
    }

    if (!geometry) continue;

    const material = createSegmentMaterial(chainIndex, segmentKind);
    sharedMaterials.push(material);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `chain-${segment.chainId}-${segment.type}-${segment.segmentIndex}`;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    cartoonGroup.add(mesh);
  }

  cartoonGroup.userData.sharedMaterials = sharedMaterials;
  return cartoonGroup;
}
