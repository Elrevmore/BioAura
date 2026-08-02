import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { resolvePickHit } from '../core/resolvePickHit';
import { useProtein } from '../hooks/useProtein';
import { useSelection } from '../hooks/useSelection';
import { useStructureModel } from '../hooks/useStructureModel';

const DRAG_THRESHOLD_PX = 5;
const PROTEIN_STRUCTURE_NAME = 'protein-structure';

function collectVisiblePickTargets(root: THREE.Object3D): THREE.Object3D[] {
  const targets: THREE.Object3D[] = [];

  root.traverse((child) => {
    if (!child.visible) return;

    if (child instanceof THREE.InstancedMesh && child.name === 'atoms') {
      targets.push(child);
      return;
    }

    if (child instanceof THREE.Mesh && child.parent?.name === 'cartoon') {
      targets.push(child);
    }
  });

  return targets;
}

/**
 * Raycasts visible protein meshes on click and forwards hits to SelectionManager.
 * Gesture picking should call the same SelectionManager.select() API.
 */
export function ProteinPicker() {
  const { camera, gl, scene } = useThree();
  const { status } = useProtein();
  const structureModel = useStructureModel();
  const { select, clearSelection } = useSelection();

  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const pointerDown = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (status !== 'loaded' || !structureModel) {
      return;
    }

    const canvas = gl.domElement;
    const { pickIndex } = structureModel;

    const onPointerDown = (event: PointerEvent) => {
      pointerDown.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: PointerEvent) => {
      const down = pointerDown.current;
      pointerDown.current = null;
      if (!down) return;

      const dx = event.clientX - down.x;
      const dy = event.clientY - down.y;
      if (dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
        return;
      }

      const structureRoot = scene.getObjectByName(PROTEIN_STRUCTURE_NAME);
      if (!structureRoot) return;

      const rect = canvas.getBoundingClientRect();
      pointer.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(pointer.current, camera);
      const targets = collectVisiblePickTargets(structureRoot);
      const hits = raycaster.current.intersectObjects(targets, false);

      if (hits.length === 0) {
        clearSelection();
        return;
      }

      const resolved = resolvePickHit(hits[0], pickIndex, structureRoot, {
        promoteToChain: event.shiftKey,
        promoteToLigand: event.shiftKey,
      });

      if (resolved) {
        select(resolved);
      } else {
        clearSelection();
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, [camera, clearSelection, gl.domElement, scene, select, status, structureModel]);

  return null;
}
