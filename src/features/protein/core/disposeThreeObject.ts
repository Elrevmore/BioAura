import * as THREE from 'three';

/** Dispose GPU resources for a Three.js object subtree */
export function disposeThreeObject(object: THREE.Object3D): void {
  const sharedGeometries = new Set<THREE.BufferGeometry>(
    (object.userData.sharedGeometries as THREE.BufferGeometry[] | undefined) ?? [],
  );
  const sharedMaterials = new Set<THREE.Material>(
    (object.userData.sharedMaterials as THREE.Material[] | undefined) ?? [],
  );
  const disposedGeometries = new Set<THREE.BufferGeometry>();

  object.traverse((child) => {
    if (child instanceof THREE.InstancedMesh) {
      const geometry = child.geometry;
      if (!sharedGeometries.has(geometry) && !disposedGeometries.has(geometry)) {
        geometry.dispose();
        disposedGeometries.add(geometry);
      }

      const mat = child.material;
      if (!sharedMaterials.has(mat as THREE.Material)) {
        if (Array.isArray(mat)) {
          mat.forEach((m) => {
            if (!sharedMaterials.has(m)) m.dispose();
          });
        } else {
          (mat as THREE.Material).dispose();
        }
      }
      return;
    }

    if (!(child instanceof THREE.Mesh)) return;

    const geometry = child.geometry;
    if (!sharedGeometries.has(geometry) && !disposedGeometries.has(geometry)) {
      geometry.dispose();
      disposedGeometries.add(geometry);
    }

    const mat = child.material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => m.dispose());
    } else {
      mat.dispose();
    }
  });

  for (const geometry of sharedGeometries) {
    geometry.dispose();
  }
}
