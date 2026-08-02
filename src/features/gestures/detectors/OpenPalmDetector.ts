import { GESTURE_CONFIG } from '@shared/config';
import type { GestureDetector, GestureEvent, GestureType, HandLandmarks } from '@shared/types';
import {
  countExtendedFingers,
  hasTrackingConfidence,
  isPinchActive,
} from '../utils/landmarkUtils';

/**
 * Detects an open palm — all fingers extended, not pinching.
 * Stateful: requires consecutive qualifying frames before emitting so brief
 * manipulation gaps do not immediately claim open_palm.
 */
export class OpenPalmDetector implements GestureDetector {
  readonly name: GestureType = 'open_palm';

  private consecutiveFrames = 0;

  detect(hands: HandLandmarks[]): GestureEvent | null {
    if (hands.length === 0) {
      this.consecutiveFrames = 0;
      return null;
    }

    const hand = hands[0];
    if (!hasTrackingConfidence(hand)) {
      this.consecutiveFrames = 0;
      return null;
    }

    const extendedCount = countExtendedFingers(hand);

    if (extendedCount < GESTURE_CONFIG.openPalmMinExtendedFingers) {
      this.consecutiveFrames = 0;
      return null;
    }

    if (isPinchActive(hand)) {
      this.consecutiveFrames = 0;
      return null;
    }

    this.consecutiveFrames++;

    if (this.consecutiveFrames < GESTURE_CONFIG.openPalmEnterFrames) {
      return null;
    }

    const confidence = extendedCount / 4;

    return {
      type: 'open_palm',
      confidence,
      timestamp: 0,
      payload: {
        extendedFingers: extendedCount,
        openness: confidence,
        handIndex: 0,
      },
    };
  }

  reset(): void {
    this.consecutiveFrames = 0;
  }
}
