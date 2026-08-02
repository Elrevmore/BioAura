import type { GestureDetector, GestureEvent, GestureType, HandLandmarks } from '@shared/types';
import { GESTURE_CONFIG } from '@shared/config';
import { signalManipulatorYieldsToPinch } from '../utils/gestureYield';
import { hasTrackingConfidence, pinchDistance } from '../utils/landmarkUtils';

/**
 * Detects thumb–index pinch on a single hand.
 * Stateful: hysteresis prevents flicker at the distance threshold.
 */
export class PinchDetector implements GestureDetector {
  readonly name: GestureType = 'pinch';

  private isPinching = false;

  detect(hands: HandLandmarks[]): GestureEvent | null {
    if (hands.length === 0) return null;

    const hand = hands[0];
    if (!hasTrackingConfidence(hand)) return null;

    const distance = pinchDistance(hand);
    const enterThreshold = GESTURE_CONFIG.pinchDistanceThreshold;
    const exitThreshold = GESTURE_CONFIG.pinchReleaseThreshold;

    if (!this.isPinching) {
      if (distance > enterThreshold) return null;
      this.isPinching = true;
    } else if (distance > exitThreshold) {
      this.isPinching = false;
      return null;
    }

    const confidence = 1 - distance / enterThreshold;

    signalManipulatorYieldsToPinch();

    return {
      type: 'pinch',
      confidence,
      timestamp: 0,
      payload: {
        distance,
        strength: confidence,
        handIndex: 0,
      },
    };
  }

  reset(): void {
    this.isPinching = false;
  }
}
