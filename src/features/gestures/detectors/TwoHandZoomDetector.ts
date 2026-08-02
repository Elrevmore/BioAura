import { GESTURE_CONFIG } from '@shared/config';
import type { GestureDetector, GestureEvent, GestureType, HandLandmarks } from '@shared/types';
import {
  handsPalmDistance,
  hasTrackingConfidence,
  isPinchActive,
} from '../utils/landmarkUtils';

/**
 * Detects two-hand zoom — tracks inter-palm distance and delta.
 * Stateful: maintains baseline distance for scale ratio.
 * Ignored when either hand is pinching so single-hand pinch still works.
 */
export class TwoHandZoomDetector implements GestureDetector {
  readonly name: GestureType = 'two_hand_zoom';

  private baselineDistance = 0;
  private smoothedDistance = 0;
  private initialized = false;

  detect(hands: HandLandmarks[]): GestureEvent | null {
    if (hands.length < 2) {
      this.reset();
      return null;
    }

    const [first, second] = hands;
    if (!hasTrackingConfidence(first) || !hasTrackingConfidence(second)) {
      return null;
    }

    if (isPinchActive(first) || isPinchActive(second)) {
      return null;
    }

    const distance = handsPalmDistance(hands);

    if (distance < GESTURE_CONFIG.twoHandMinDistance) {
      return null;
    }

    if (!this.initialized) {
      this.baselineDistance = distance;
      this.smoothedDistance = distance;
      this.initialized = true;
      return null;
    }

    const prevDistance = this.smoothedDistance;
    this.smoothedDistance =
      GESTURE_CONFIG.zoomSmoothing * this.smoothedDistance +
      (1 - GESTURE_CONFIG.zoomSmoothing) * distance;

    const delta = this.smoothedDistance - prevDistance;

    if (Math.abs(delta) < GESTURE_CONFIG.zoomMinDelta) {
      return null;
    }

    const scale = this.smoothedDistance / this.baselineDistance;
    const confidence = Math.min(first.confidence, second.confidence);

    return {
      type: 'two_hand_zoom',
      confidence,
      timestamp: 0,
      payload: {
        distance: this.smoothedDistance,
        delta,
        scale,
        baseline: this.baselineDistance,
      },
    };
  }

  reset(): void {
    this.baselineDistance = 0;
    this.smoothedDistance = 0;
    this.initialized = false;
  }
}
