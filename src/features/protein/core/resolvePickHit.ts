import * as THREE from 'three';
import type { PickIndex } from './buildPickIndex';
import type { SelectedObject } from '../types/selection.types';

export interface PickResolveOptions {
  /** Shift+click on cartoon promotes selection to the full chain. */
  promoteToChain?: boolean;
  /** Shift+click on a ligand atom promotes selection to the ligand residue. */
  promoteToLigand?: boolean;
}

const _caWorld = new THREE.Vector3();

function resolveInstancedAtom(
  instanceId: number,
  layer: 'ligands' | 'polymer-atoms',
  pickIndex: PickIndex,
  options: PickResolveOptions,
): SelectedObject | null {
  const refs =
    layer === 'ligands' ? pickIndex.ligandInstances : pickIndex.polymerInstances;
  const ref = refs[instanceId];
  if (!ref) return null;

  if (options.promoteToLigand && layer === 'ligands') {
    return {
      type: 'ligand',
      chainId: ref.chainId,
      residue: ref.residue,
    };
  }

  return {
    type: 'atom',
    chainId: ref.chainId,
    residue: ref.residue,
    atom: ref.atom,
  };
}

function findNearestResidueFromCartoonHit(
  entry: PickIndex['cartoonByMeshName'] extends Map<string, infer V> ? V : never,
  intersection: THREE.Intersection,
  structureRoot: THREE.Object3D,
): { chainId: string; residue: (typeof entry.caResiduePairs)[number]['residue'] } | null {
  let best: { chainId: string; residue: (typeof entry.caResiduePairs)[number]['residue']; distSq: number } | null =
    null;

  for (const { ca, residue } of entry.caResiduePairs) {
    _caWorld.set(ca.x, ca.y, ca.z);
    structureRoot.localToWorld(_caWorld);
    const distSq = _caWorld.distanceToSquared(intersection.point);

    if (!best || distSq < best.distSq) {
      best = { chainId: entry.chainId, residue, distSq };
    }
  }

  return best ? { chainId: best.chainId, residue: best.residue } : null;
}

function resolveCartoonMesh(
  mesh: THREE.Mesh,
  intersection: THREE.Intersection,
  pickIndex: PickIndex,
  structureRoot: THREE.Object3D,
  options: PickResolveOptions,
): SelectedObject | null {
  const entry = pickIndex.cartoonByMeshName.get(mesh.name);
  if (!entry) return null;

  if (options.promoteToChain) {
    const chain = pickIndex.chainById.get(entry.chainId);
    if (!chain) return null;
    return { type: 'chain', chain };
  }

  const nearest = findNearestResidueFromCartoonHit(entry, intersection, structureRoot);
  if (!nearest) return null;

  return {
    type: 'residue',
    chainId: nearest.chainId,
    residue: nearest.residue,
  };
}

function findAtomLayer(object: THREE.Object3D): 'ligands' | 'polymer-atoms' | null {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.name === 'ligands') return 'ligands';
    if (current.name === 'polymer-atoms') return 'polymer-atoms';
    current = current.parent;
  }
  return null;
}

/**
 * Maps a raycast intersection on visible protein geometry to a structure selection.
 */
export function resolvePickHit(
  intersection: THREE.Intersection,
  pickIndex: PickIndex,
  structureRoot: THREE.Object3D,
  options: PickResolveOptions = {},
): SelectedObject | null {
  const { object } = intersection;

  if (object instanceof THREE.InstancedMesh && intersection.instanceId !== undefined) {
    const layer = findAtomLayer(object);
    if (!layer) return null;
    return resolveInstancedAtom(intersection.instanceId, layer, pickIndex, options);
  }

  if (object instanceof THREE.Mesh) {
    return resolveCartoonMesh(object, intersection, pickIndex, structureRoot, options);
  }

  return null;
}
