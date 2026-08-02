import { GESTURE_CONFIG } from '@shared/config';
import type { GestureDetector, GestureEvent, GestureType, HandLandmarks } from '@shared/types';
import {
  countExtendedFingers,
  hasTrackingConfidence,
  isGrabPose,
  isPinchHeld,
} from '../utils/landmarkUtils';

type ActiveManipulation = 'pinch' | 'grab' | 'none';

/**
 * Detects release — transition from pinch/grab back to open hand or no contact.
 * Stateful: tracks previous manipulation pose.
 */
export class ReleaseDetector implements GestureDetector {
  readonly name: GestureType = 'release';

  private previousManipulation: ActiveManipulation = 'none';

  detect(hands: HandLandmarks[]): GestureEvent | null {
    if (hands.length === 0) {
      const wasManipulating = this.previousManipulation !== 'none';
      this.previousManipulation = 'none';
      return wasManipulating ? this.buildRelease('none') : null;
    }

    const hand = hands[0];
    if (!hasTrackingConfidence(hand)) return null;

    const current = this.classifyManipulation(hand);
    const wasManipulating = this.previousManipulation !== 'none';
    const isReleased =
      current === 'none' ||
      countExtendedFingers(hand) >= GESTURE_CONFIG.openPalmMinExtendedFingers;

    let event: GestureEvent | null = null;

    if (wasManipulating && isReleased && current !== this.previousManipulation) {
      event = this.buildRelease(this.previousManipulation);
    }

    this.previousManipulation = current;
    return event;
  }

  reset(): void {
    this.previousManipulation = 'none';
  }

  private classifyManipulation(hand: HandLandmarks): ActiveManipulation {
    if (isPinchHeld(hand)) {
      return 'pinch';
    }

    if (isGrabPose(hand)) {
      return 'grab';
    }

    return 'none';
  }

  private buildRelease(from: ActiveManipulation | string): GestureEvent {
    return {
      type: 'release',
      confidence: GESTURE_CONFIG.releaseConfidenceThreshold,
      timestamp: 0,
      payload: {
        fromGesture: from === 'pinch' ? 1 : from === 'grab' ? 2 : 0,
      },
    };
  }
}
