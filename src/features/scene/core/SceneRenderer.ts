import * as THREE from 'three';
import type { SceneRendererConfig } from './SceneConfig';

/**
 * Factory for WebGLRenderer with BioAura defaults.
 * R3F owns the render loop in React mode; this class is used for
 * imperative setups and renderer configuration reference.
 */
export class SceneRenderer {
  readonly renderer: THREE.WebGLRenderer;

  constructor(config: SceneRendererConfig) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: config.antialias,
      alpha: config.alpha,
      powerPreference: 'high-performance',
    });

    this.renderer.setPixelRatio(config.pixelRatio);
    this.renderer.setClearColor(config.backgroundColor, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  setSize(width: number, height: number): void {
    this.renderer.setSize(width, height, false);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}
