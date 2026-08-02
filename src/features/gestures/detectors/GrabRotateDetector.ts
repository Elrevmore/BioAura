import { GESTURE_CONFIG } from '@shared/config';
import type { GestureDetector, GestureEvent, GestureType, HandLandmarks } from '@shared/types';
import { manipulatorShouldYieldToPinch } from '../utils/gestureYield';
import {
  handGrabTwistAngle,
  hasTrackingConfidence,
  isGrabPose,
  isPinchActive,
  isPinchHeld,
  normalizeAngleDelta,
  smoothAngle,
} from '../utils/landmarkUtils';

/**
 * Detects wrist rotation while holding a closed fist (grab pose).
 * Arms on stable grab, promotes to grab_rotate on sustained wrist movement,
 * and holds across brief still frames. Yields to pinch and plain grab translate.
 */
export class GrabRotateDetector implements GestureDetector {
  readonly name: GestureType = 'grab_rotate';

  private smoothedAngle: number | null = null;
  private previousAngle: number | null = null;
  private smoothedDelta = 0;
  private isArmed = false;
  private isRotating = false;
  private grabHoldFrames = 0;
  private grabFailFrames = 0;
  private movementFrames = 0;
  private stillFrames = 0;

  detect(hands: HandLandmarks[]): GestureEvent | null {
    if (hands.length === 0) {
      this.reset();
      return null;
    }

    if (hands.length >= 2) {
      this.reset();
      return null;
    }

    const hand = hands[0];

    if (!hasTrackingConfidence(hand) || this.yieldsToPinch(hand)) {
      this.reset();
      return null;
    }

    if (!isGrabPose(hand)) {
      return this.handleGrabPoseFailure();
    }

    this.grabFailFrames = 0;

    if (!this.isArmed) {
      this.grabHoldFrames++;

      if (this.grabHoldFrames < GESTURE_CONFIG.grabRotateGrabHoldFrames) {
        return null;
      }

      this.isArmed = true;
    }

    const rawAngle = handGrabTwistAngle(hand);
    this.smoothedAngle =
      this.smoothedAngle === null
        ? rawAngle
        : smoothAngle(
            this.smoothedAngle,
            rawAngle,
            GESTURE_CONFIG.grabRotateAngleSmoothing,
          );

    const angle = this.smoothedAngle;

    if (this.previousAngle === null) {
      this.previousAngle = angle;
      return null;
    }

    const delta = normalizeAngleDelta(angle - this.previousAngle);
    this.previousAngle = angle;

    const significant = Math.abs(delta) >= GESTURE_CONFIG.grabRotateMinDelta;

    if (significant) {
      this.movementFrames = Math.min(
        this.movementFrames + 1,
        GESTURE_CONFIG.grabRotateEnterFrames,
      );
      this.stillFrames = 0;
    } else if (this.isRotating) {
      this.stillFrames++;
    } else {
      this.movementFrames = Math.max(0, this.movementFrames - 1);
      return null;
    }

    if (!this.isRotating) {
      if (this.movementFrames < GESTURE_CONFIG.grabRotateEnterFrames) {
        return null;
      }

      this.isRotating = true;
    } else if (this.stillFrames >= GESTURE_CONFIG.grabRotateExitFrames) {
      this.resetRotationState();
      return null;
    }

    return this.buildGrabRotateEvent(angle, delta);
  }

  reset(): void {
    this.smoothedAngle = null;
    this.grabHoldFrames = 0;
    this.grabFailFrames = 0;
    this.resetRotationState();
    this.isArmed = false;
  }

  private yieldsToPinch(hand: HandLandmarks): boolean {
    return (
      manipulatorShouldYieldToPinch() || isPinchHeld(hand) || isPinchActive(hand)
    );
  }

  private handleGrabPoseFailure(): GestureEvent | null {
    this.grabFailFrames++;

    if (this.isRotating) {
      if (this.grabFailFrames < GESTURE_CONFIG.grabRotatePoseFailureFrames) {
        this.stillFrames++;

        if (this.stillFrames >= GESTURE_CONFIG.grabRotateExitFrames) {
          this.reset();
          return null;
        }

        return this.buildGrabRotateEvent(this.smoothedAngle ?? 0, 0);
      }

      this.reset();
      return null;
    }

    if (
      (this.isArmed || this.grabHoldFrames > 0) &&
      this.grabFailFrames < GESTURE_CONFIG.grabExitFrames
    ) {
      return null;
    }

    this.reset();
    return null;
  }

  private buildGrabRotateEvent(angle: number, delta: number): GestureEvent {
    const alpha = GESTURE_CONFIG.grabRotateDeltaSmoothing;
    this.smoothedDelta = this.smoothedDelta * (1 - alpha) + delta * alpha;

    return {
      type: 'grab_rotate',
      confidence: Math.max(0.55, Math.min(1, Math.abs(this.smoothedDelta) * 10)),
      timestamp: 0,
      payload: {
        angle,
        delta: this.smoothedDelta,
        handIndex: 0,
      },
    };
  }

  private resetRotationState(): void {
    this.previousAngle = null;
    this.smoothedDelta = 0;
    this.isRotating = false;
    this.movementFrames = 0;
    this.stillFrames = 0;
  }
}
