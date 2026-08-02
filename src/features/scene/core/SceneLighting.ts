import * as THREE from 'three';
import type { SceneLightingConfig } from './SceneConfig';

export interface SceneLightSet {
  ambient: THREE.AmbientLight;
  key: THREE.DirectionalLight;
  fill: THREE.PointLight;
  rim: THREE.PointLight;
}

/**
 * Creates and manages the scene lighting rig.
 * Key + fill + rim setup gives depth to molecular structures.
 */
export class SceneLighting {
  readonly lights: SceneLightSet;

  constructor(config: SceneLightingConfig) {
    const ambient = new THREE.AmbientLight(0xffffff, config.ambientIntensity);

    const key = new THREE.DirectionalLight(0xcffafe, config.keyIntensity);
    key.position.set(5, 8, 6);
    key.castShadow = false;

    const fill = new THREE.PointLight(0x22d3ee, config.fillIntensity, 40);
    fill.position.set(-6, 2, 4);

    const rim = new THREE.PointLight(0x8b5cf6, config.rimIntensity, 40);
    rim.position.set(0, -4, -8);

    this.lights = { ambient, key, fill, rim };
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(
      this.lights.ambient,
      this.lights.key,
      this.lights.fill,
      this.lights.rim,
    );
  }

  removeFromScene(scene: THREE.Scene): void {
    scene.remove(
      this.lights.ambient,
      this.lights.key,
      this.lights.fill,
      this.lights.rim,
    );
  }

  dispose(): void {
    this.lights.ambient.dispose();
    this.lights.key.dispose();
    this.lights.fill.dispose();
    this.lights.rim.dispose();
  }
}
