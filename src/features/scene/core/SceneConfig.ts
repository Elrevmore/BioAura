import { SCENE_CONFIG } from '@shared/config';
import type { ProteinTransform } from '@shared/types';

export interface SceneCameraConfig {
  fov: number;
  near: number;
  far: number;
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface SceneLightingConfig {
  ambientIntensity: number;
  keyIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
}

export interface SceneRendererConfig {
  backgroundColor: number;
  antialias: boolean;
  alpha: boolean;
  pixelRatio: number;
}

export interface SceneConfig {
  camera: SceneCameraConfig;
  lighting: SceneLightingConfig;
  renderer: SceneRendererConfig;
  enableOrbitControls: boolean;
}

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  camera: {
    fov: SCENE_CONFIG.cameraFov,
    near: SCENE_CONFIG.cameraNear,
    far: SCENE_CONFIG.cameraFar,
    position: [0, 2, 12],
    lookAt: [0, 0, 0],
  },
  lighting: {
    ambientIntensity: 0.35,
    keyIntensity: 1.2,
    fillIntensity: 0.6,
    rimIntensity: 0.8,
  },
  renderer: {
    backgroundColor: SCENE_CONFIG.backgroundColor,
    antialias: true,
    alpha: false,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  },
  enableOrbitControls: SCENE_CONFIG.enableOrbitControlsInDev,
};

export const DEFAULT_PROTEIN_TRANSFORM: ProteinTransform = {
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
  position: { x: 0, y: 0, z: 0 },
};
