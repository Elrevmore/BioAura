import * as THREE from 'three';
import type { ProteinTransform } from '@shared/types';
import {
  DEFAULT_PROTEIN_TRANSFORM,
  DEFAULT_SCENE_CONFIG,
  type SceneConfig,
} from './SceneConfig';

type TransformListener = (transform: ProteinTransform) => void;
type ResetListener = () => void;

/**
 * Central orchestrator for scene configuration and protein transforms.
 * GPU resources (scene, renderer) are owned by React Three Fiber;
 * reusable factory classes (SceneCamera, SceneLighting, SceneRenderer)
 * provide imperative configuration when needed.
 */
export class SceneManager {
  readonly config: SceneConfig;

  private transform: ProteinTransform = { ...DEFAULT_PROTEIN_TRANSFORM };
  private readonly listeners = new Set<TransformListener>();
  private readonly resetListeners = new Set<ResetListener>();

  constructor(config: SceneConfig = DEFAULT_SCENE_CONFIG) {
    this.config = config;
  }

  getTransform(): Readonly<ProteinTransform> {
    return this.transform;
  }

  setRotation(x: number, y: number, z: number): void {
    this.transform = {
      ...this.transform,
      rotation: { x, y, z },
    };
    this.notify();
  }

  setScale(scale: number): void {
    this.transform = { ...this.transform, scale };
    this.notify();
  }

  setPosition(x: number, y: number, z: number): void {
    this.transform = {
      ...this.transform,
      position: { x, y, z },
    };
    this.notify();
  }

  applyTransform(transform: Partial<ProteinTransform>): void {
    this.transform = {
      rotation: transform.rotation ?? this.transform.rotation,
      scale: transform.scale ?? this.transform.scale,
      position: transform.position ?? this.transform.position,
    };
    this.notify();
  }

  resetTransform(): void {
    this.transform = { ...DEFAULT_PROTEIN_TRANSFORM };
    this.notify();
    this.notifyReset();
  }

  subscribe(listener: TransformListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeReset(listener: ResetListener): () => void {
    this.resetListeners.add(listener);
    return () => this.resetListeners.delete(listener);
  }

  /** Apply current transform to a Three.js group (protein root) */
  applyToGroup(group: THREE.Object3D): void {
    const { rotation, scale, position } = this.transform;
    group.rotation.set(rotation.x, rotation.y, rotation.z);
    group.scale.setScalar(scale);
    group.position.set(position.x, position.y, position.z);
  }

  dispose(): void {
    this.listeners.clear();
    this.resetListeners.clear();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.transform);
    }
  }

  private notifyReset(): void {
    for (const listener of this.resetListeners) {
      listener();
    }
  }
}
