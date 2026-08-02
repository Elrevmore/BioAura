import type { GestureEvent, GestureType, HandLandmarks } from '@shared/types';
import {
  GrabDetector,
  GrabRotateDetector,
  OpenPalmDetector,
  PinchDetector,
  ReleaseDetector,
  TwoHandZoomDetector,
} from '../detectors';

interface StatefulDetector {
  readonly name: GestureType;
  detect(hands: HandLandmarks[]): GestureEvent | null;
  reset?(): void;
}

/**
 * Orchestrates gesture detectors in priority order.
 * First matching gesture wins; stateful detectors reset when hands disappear.
 */
export class GestureEngine {
  private readonly detectors: StatefulDetector[];
  private lastHandsPresent = false;

  constructor() {
    this.detectors = [
      new TwoHandZoomDetector(),
      new PinchDetector(),
      new GrabRotateDetector(),
      new GrabDetector(),
      new ReleaseDetector(),
      new OpenPalmDetector(),
    ];
  }

  detect(hands: HandLandmarks[], timestamp: number): GestureEvent {
    const handsPresent = hands.length > 0;

    if (!handsPresent && this.lastHandsPresent) {
      this.resetStatefulDetectors();
    }
    this.lastHandsPresent = handsPresent;

    for (const detector of this.detectors) {
      const event = detector.detect(hands);
      if (event) {
        return { ...event, timestamp };
      }
    }

    return {
      type: 'none',
      confidence: 1,
      timestamp,
    };
  }

  reset(): void {
    this.resetStatefulDetectors();
    this.lastHandsPresent = false;
  }

  private resetStatefulDetectors(): void {
    for (const detector of this.detectors) {
      detector.reset?.();
    }
  }
}
