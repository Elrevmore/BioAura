import * as THREE from 'three';
import type { SceneCameraConfig } from './SceneConfig';

/**
 * Encapsulates perspective camera creation and configuration.
 * Usable imperatively or as a factory for R3F integration.
 */
export class SceneCamera {
  readonly camera: THREE.PerspectiveCamera;

  constructor(config: SceneCameraConfig, aspect = 1) {
    this.camera = new THREE.PerspectiveCamera(
      config.fov,
      aspect,
      config.near,
      config.far,
    );
    this.camera.position.set(...config.position);
    this.camera.lookAt(...config.lookAt);
  }

  updateAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    // PerspectiveCamera has no GPU resources to release
  }
}
