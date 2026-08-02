import * as THREE from 'three';
import type { PickIndex } from './buildPickIndex';
import type { AtomSelection, SelectedObject } from '../types/selection.types';
import { cpkColorForElement } from './cpkColors';

const HIGHLIGHT_COLOR = new THREE.Color(0x22d3ee);
const _tmpColor = new THREE.Color();

export interface HighlightSnapshot {
  instancedColors: Map<THREE.InstancedMesh, Map<number, THREE.Color>>;
  cartoonMaterials: Map<
    THREE.MeshStandardMaterial,
    { emissive: THREE.Color; emissiveIntensity: number }
  >;
}

export function createHighlightSnapshot(): HighlightSnapshot {
  return {
    instancedColors: new Map(),
    cartoonMaterials: new Map(),
  };
}

function collectVisibleInstancedMeshes(root: THREE.Object3D): THREE.InstancedMesh[] {
  const meshes: THREE.InstancedMesh[] = [];
  root.traverse((child) => {
    if (!child.visible) return;
    if (child instanceof THREE.InstancedMesh && child.name === 'atoms') {
      meshes.push(child);
    }
  });
  return meshes;
}

function collectVisibleCartoonMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const cartoon = root.getObjectByName('cartoon');
  if (!cartoon || !cartoon.visible) return [];

  const meshes: THREE.Mesh[] = [];
  cartoon.traverse((child) => {
    if (child instanceof THREE.Mesh && child.visible) {
      meshes.push(child);
    }
  });
  return meshes;
}

function storeInstanceColor(
  mesh: THREE.InstancedMesh,
  instanceId: number,
  snapshot: HighlightSnapshot,
): void {
  if (!mesh.instanceColor) return;

  let meshMap = snapshot.instancedColors.get(mesh);
  if (!meshMap) {
    meshMap = new Map();
    snapshot.instancedColors.set(mesh, meshMap);
  }

  if (meshMap.has(instanceId)) return;

  _tmpColor.setHex(0xffffff);
  mesh.getColorAt(instanceId, _tmpColor);
  meshMap.set(instanceId, _tmpColor.clone());
}

function setInstanceHighlight(
  mesh: THREE.InstancedMesh,
  instanceId: number,
  snapshot: HighlightSnapshot,
): void {
  if (!mesh.instanceColor) return;
  storeInstanceColor(mesh, instanceId, snapshot);
  mesh.setColorAt(instanceId, HIGHLIGHT_COLOR);
}

function storeCartoonMaterial(
  material: THREE.MeshStandardMaterial,
  snapshot: HighlightSnapshot,
): void {
  if (snapshot.cartoonMaterials.has(material)) return;
  snapshot.cartoonMaterials.set(material, {
    emissive: material.emissive.clone(),
    emissiveIntensity: material.emissiveIntensity,
  });
}

function highlightCartoonMesh(mesh: THREE.Mesh, snapshot: HighlightSnapshot): void {
  const material = mesh.material;
  if (!(material instanceof THREE.MeshStandardMaterial)) return;
  storeCartoonMaterial(material, snapshot);
  material.emissive.copy(HIGHLIGHT_COLOR);
  material.emissiveIntensity = 0.55;
}

function indicesForResidue(
  instances: PickIndex['ligandInstances'],
  chainId: string,
  residue: PickIndex['ligandInstances'][number]['residue'],
): number[] {
  const indices: number[] = [];
  for (let i = 0; i < instances.length; i++) {
    const ref = instances[i];
    if (ref.chainId === chainId && ref.residue === residue) {
      indices.push(i);
    }
  }
  return indices;
}

function indicesForChain(
  instances: PickIndex['polymerInstances'],
  chainId: string,
): number[] {
  const indices: number[] = [];
  for (let i = 0; i < instances.length; i++) {
    if (instances[i].chainId === chainId) {
      indices.push(i);
    }
  }
  return indices;
}

function highlightInstances(
  meshes: THREE.InstancedMesh[],
  layer: 'ligands' | 'polymer-atoms',
  instanceIds: number[],
  snapshot: HighlightSnapshot,
): void {
  const mesh = meshes.find((candidate) => findAtomLayer(candidate) === layer);
  if (!mesh) return;

  for (const id of instanceIds) {
    setInstanceHighlight(mesh, id, snapshot);
  }
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
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

function highlightCartoonForChain(
  cartoonMeshes: THREE.Mesh[],
  chainId: string,
  snapshot: HighlightSnapshot,
): void {
  const prefix = `chain-${chainId}-`;
  for (const mesh of cartoonMeshes) {
    if (mesh.name.startsWith(prefix)) {
      highlightCartoonMesh(mesh, snapshot);
    }
  }
}

function highlightCartoonForResidue(
  pickIndex: PickIndex,
  cartoonMeshes: THREE.Mesh[],
  chainId: string,
  residue: PickIndex['ligandInstances'][number]['residue'],
  structureRoot: THREE.Object3D,
  snapshot: HighlightSnapshot,
): void {
  for (const mesh of cartoonMeshes) {
    const entry = pickIndex.cartoonByMeshName.get(mesh.name);
    if (!entry || entry.chainId !== chainId) continue;

    const matches = entry.caResiduePairs.some((pair) => pair.residue === residue);
    if (matches) {
      highlightCartoonMesh(mesh, snapshot);
    }
  }

  // Also highlight polymer atom instances when the layer is visible.
  const instancedMeshes = collectVisibleInstancedMeshes(structureRoot);
  const polymerIndices = indicesForResidue(
    pickIndex.polymerInstances,
    chainId,
    residue,
  );
  highlightInstances(instancedMeshes, 'polymer-atoms', polymerIndices, snapshot);
}

export function clearSelectionHighlight(snapshot: HighlightSnapshot): void {
  for (const [mesh, colorMap] of snapshot.instancedColors) {
    if (!mesh.instanceColor) continue;
    for (const [instanceId, color] of colorMap) {
      mesh.setColorAt(instanceId, color);
    }
    mesh.instanceColor.needsUpdate = true;
  }
  snapshot.instancedColors.clear();

  for (const [material, original] of snapshot.cartoonMaterials) {
    material.emissive.copy(original.emissive);
    material.emissiveIntensity = original.emissiveIntensity;
  }
  snapshot.cartoonMaterials.clear();
}

function highlightAtomSelection(
  selection: AtomSelection,
  pickIndex: PickIndex,
  instancedMeshes: THREE.InstancedMesh[],
  snapshot: HighlightSnapshot,
): void {
  const layer = selection.residue.isPolymer ? 'polymer-atoms' : 'ligands';
  const instances =
    layer === 'ligands' ? pickIndex.ligandInstances : pickIndex.polymerInstances;
  const index = instances.findIndex(
    (ref) =>
      ref.chainId === selection.chainId &&
      ref.residue === selection.residue &&
      ref.atom === selection.atom,
  );
  if (index >= 0) {
    highlightInstances(instancedMeshes, layer, [index], snapshot);
  }
}

/**
 * Applies lightweight visual emphasis without rebuilding geometry.
 */
export function applySelectionHighlight(
  selection: SelectedObject | null,
  pickIndex: PickIndex,
  structureRoot: THREE.Object3D,
  snapshot: HighlightSnapshot,
  atomSelections: AtomSelection[] = [],
): void {
  clearSelectionHighlight(snapshot);

  const instancedMeshes = collectVisibleInstancedMeshes(structureRoot);
  const cartoonMeshes = collectVisibleCartoonMeshes(structureRoot);

  if (atomSelections.length > 0) {
    for (const atomSelection of atomSelections) {
      highlightAtomSelection(atomSelection, pickIndex, instancedMeshes, snapshot);
    }
    return;
  }

  if (!selection) return;

  switch (selection.type) {
    case 'atom': {
      highlightAtomSelection(selection, pickIndex, instancedMeshes, snapshot);
      break;
    }
    case 'residue': {
      highlightCartoonForResidue(
        pickIndex,
        cartoonMeshes,
        selection.chainId,
        selection.residue,
        structureRoot,
        snapshot,
      );
      const ligandIndices = indicesForResidue(
        pickIndex.ligandInstances,
        selection.chainId,
        selection.residue,
      );
      highlightInstances(instancedMeshes, 'ligands', ligandIndices, snapshot);
      break;
    }
    case 'chain': {
      highlightCartoonForChain(cartoonMeshes, selection.chain.chainId, snapshot);
      const polymerIndices = indicesForChain(
        pickIndex.polymerInstances,
        selection.chain.chainId,
      );
      highlightInstances(instancedMeshes, 'polymer-atoms', polymerIndices, snapshot);

      const ligandIndices: number[] = [];
      for (let i = 0; i < pickIndex.ligandInstances.length; i++) {
        if (pickIndex.ligandInstances[i].chainId === selection.chain.chainId) {
          ligandIndices.push(i);
        }
      }
      highlightInstances(instancedMeshes, 'ligands', ligandIndices, snapshot);
      break;
    }
    case 'ligand': {
      const ligandIndices = indicesForResidue(
        pickIndex.ligandInstances,
        selection.chainId,
        selection.residue,
      );
      highlightInstances(instancedMeshes, 'ligands', ligandIndices, snapshot);
      break;
    }
    default:
      break;
  }
}

/** Restores a single instance color from element symbol (fallback path). */
export function fallbackInstanceColor(atomElement: string): THREE.Color {
  return cpkColorForElement(atomElement);
}
