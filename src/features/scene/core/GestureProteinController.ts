import { GESTURE_CONTROL_CONFIG } from '@shared/config';
import {
  HAND_LANDMARK,
  type GestureEvent,
  type GestureType,
  type HandLandmarks,
} from '@shared/types';
import { clamp } from '@shared/utils';
import type { SceneManager } from './SceneManager';

export interface ManipulationState {
  isActive: boolean;
  activeGesture: GestureType;
}

interface PalmPoint {
  x: number;
  y: number;
}

function palmCenter(hand: HandLandmarks) {
  const wrist = hand.landmarks[HAND_LANDMARK.WRIST];
  const indexMcp = hand.landmarks[HAND_LANDMARK.INDEX_MCP];
  const pinkyMcp = hand.landmarks[HAND_LANDMARK.PINKY_MCP];

  return {
    x: (wrist.x + indexMcp.x + pinkyMcp.x) / 3,
    y: (wrist.y + indexMcp.y + pinkyMcp.y) / 3,
    z: (wrist.z + indexMcp.z + pinkyMcp.z) / 3,
  };
}

/**
 * Maps gesture events and hand landmarks to SceneManager protein transforms.
 * Stateful — tracks palm position between frames for drag translation.
 */
export class GestureProteinController {
  private previousPalm: PalmPoint | null = null;
  private manipulating = false;

  update(
    gesture: GestureEvent,
    hands: HandLandmarks[],
    manager: SceneManager,
    mirrored: boolean,
  ): ManipulationState {
    if (hands.length === 0) {
      this.manipulating = false;
      this.previousPalm = null;
      return {
        isActive: false,
        activeGesture: gesture.type === 'none' ? 'none' : gesture.type,
      };
    }

    const transform = manager.getTransform();

    switch (gesture.type) {
      case 'pinch':
        return this.applyTranslation(gesture.type, hands, manager, transform, mirrored);

      case 'grab':
        this.manipulating = false;
        this.previousPalm = null;
        return { isActive: false, activeGesture: 'grab' };

      case 'grab_rotate':
        return this.applyRotation(gesture, manager, transform);

      case 'two_hand_zoom':
        return this.applyZoom(gesture, manager, transform);

      case 'release':
        this.manipulating = false;
        this.previousPalm = null;
        return { isActive: false, activeGesture: 'release' };

      case 'open_palm':
        this.manipulating = false;
        this.previousPalm = null;
        return { isActive: false, activeGesture: 'open_palm' };

      default:
        if (!this.manipulating) {
          this.previousPalm = null;
        }
        return {
          isActive: this.manipulating,
          activeGesture: gesture.type,
        };
    }
  }

  reset(): void {
    this.previousPalm = null;
    this.manipulating = false;
  }

  private applyTranslation(
    type: GestureType,
    hands: HandLandmarks[],
    manager: SceneManager,
    transform: ReturnType<SceneManager['getTransform']>,
    mirrored: boolean,
  ): ManipulationState {
    if (hands.length === 0) {
      return { isActive: false, activeGesture: type };
    }

    this.manipulating = true;
    const palm = palmCenter(hands[0]);
    const mirrorFactor = mirrored ? -1 : 1;

    if (this.previousPalm) {
      const dx =
        (palm.x - this.previousPalm.x) *
        GESTURE_CONTROL_CONFIG.translateSensitivity *
        mirrorFactor;
      const dy =
        -(palm.y - this.previousPalm.y) * GESTURE_CONTROL_CONFIG.translateSensitivity;

      manager.setPosition(
        clamp(
          transform.position.x + dx,
          GESTURE_CONTROL_CONFIG.minPosition,
          GESTURE_CONTROL_CONFIG.maxPosition,
        ),
        clamp(
          transform.position.y + dy,
          GESTURE_CONTROL_CONFIG.minPosition,
          GESTURE_CONTROL_CONFIG.maxPosition,
        ),
        transform.position.z,
      );
    }

    this.previousPalm = { x: palm.x, y: palm.y };
    return { isActive: true, activeGesture: type };
  }

  private applyRotation(
    gesture: GestureEvent,
    manager: SceneManager,
    transform: ReturnType<SceneManager['getTransform']>,
  ): ManipulationState {
    this.manipulating = true;
    this.previousPalm = null;

    const delta = gesture.payload?.delta ?? 0;
    manager.setRotation(
      transform.rotation.x,
      transform.rotation.y + delta * GESTURE_CONTROL_CONFIG.rotateSensitivity,
      transform.rotation.z,
    );

    return { isActive: true, activeGesture: gesture.type };
  }

  private applyZoom(
    gesture: GestureEvent,
    manager: SceneManager,
    transform: ReturnType<SceneManager['getTransform']>,
  ): ManipulationState {
    this.manipulating = true;
    this.previousPalm = null;

    const delta = gesture.payload?.delta ?? 0;
    manager.setScale(
      clamp(
        transform.scale + delta * GESTURE_CONTROL_CONFIG.zoomSensitivity,
        GESTURE_CONTROL_CONFIG.minScale,
        GESTURE_CONTROL_CONFIG.maxScale,
      ),
    );

    return { isActive: true, activeGesture: 'two_hand_zoom' };
  }
}
