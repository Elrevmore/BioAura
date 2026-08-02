import { GESTURE_CONFIG } from '@shared/config';
import type { GestureDetector, GestureEvent, GestureType, HandLandmarks } from '@shared/types';
import { manipulatorShouldYieldToPinch } from '../utils/gestureYield';
import {
  countCurledFingers,
  hasTrackingConfidence,
  isGrabPose,
  isPinchActive,
  isPinchHeld,
} from '../utils/landmarkUtils';

/**
 * Detects a closed fist / grab pose — fingers curled, not pinching.
 * Stateful: consecutive-frame enter/exit validation and full pinch hysteresis guard.
 */
export class GrabDetector implements GestureDetector {
  readonly name: GestureType = 'grab';

  private isGrabbing = false;
  private qualifyFrames = 0;
  private failFrames = 0;

  detect(hands: HandLandmarks[]): GestureEvent | null {
    if (hands.length === 0) {
      this.reset();
      return null;
    }

    const hand = hands[0];
    if (!hasTrackingConfidence(hand)) {
      this.reset();
      return null;
    }

    if (this.yieldsToPinch(hand)) {
      this.reset();
      return null;
    }

    const curledCount = countCurledFingers(hand);
    const poseQualifies = isGrabPose(hand);

    if (poseQualifies) {
      this.failFrames = 0;

      if (!this.isGrabbing) {
        this.qualifyFrames++;

        if (this.qualifyFrames < GESTURE_CONFIG.grabEnterFrames) {
          return null;
        }

        this.isGrabbing = true;
      }
    } else if (this.isGrabbing) {
      this.qualifyFrames = 0;
      this.failFrames++;

      if (this.failFrames >= GESTURE_CONFIG.grabExitFrames) {
        this.reset();
        return null;
      }
    } else {
      this.qualifyFrames = 0;
      return null;
    }

    const confidence = Math.min(1, curledCount / 4);

    return {
      type: 'grab',
      confidence,
      timestamp: 0,
      payload: {
        curledFingers: curledCount,
        handIndex: 0,
      },
    };
  }

  reset(): void {
    this.isGrabbing = false;
    this.qualifyFrames = 0;
    this.failFrames = 0;
  }

  private yieldsToPinch(hand: HandLandmarks): boolean {
    return (
      manipulatorShouldYieldToPinch() || isPinchHeld(hand) || isPinchActive(hand)
    );
  }
}
