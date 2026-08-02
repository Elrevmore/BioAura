import * as THREE from 'three';
import { SceneCamera } from './SceneCamera';
import type { SceneConfig } from './SceneConfig';
import { SceneLighting } from './SceneLighting';
import { SceneRenderer } from './SceneRenderer';

/**
 * Imperative Three.js scene stack for non-React or offscreen rendering.
 * Composes the reusable SceneCamera, SceneLighting, and SceneRenderer classes.
 */
export class SceneStack {
  readonly scene: THREE.Scene;
  readonly camera: SceneCamera;
  readonly renderer: SceneRenderer;
  readonly lighting: SceneLighting;

  constructor(config: SceneConfig, width: number, height: number) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(config.renderer.backgroundColor);
    this.scene.fog = new THREE.FogExp2(config.renderer.backgroundColor, 0.035);

    this.camera = new SceneCamera(config.camera, width / height);
    this.renderer = new SceneRenderer(config.renderer);
    this.lighting = new SceneLighting(config.lighting);

    this.renderer.setSize(width, height);
    this.lighting.addToScene(this.scene);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera.camera);
  }

  resize(width: number, height: number): void {
    this.camera.updateAspect(width / height);
    this.renderer.setSize(width, height);
  }

  dispose(): void {
    this.lighting.removeFromScene(this.scene);
    this.lighting.dispose();
    this.camera.dispose();
    this.renderer.dispose();
    this.scene.clear();
  }
}
