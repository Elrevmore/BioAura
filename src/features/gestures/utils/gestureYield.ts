/**
 * Cross-detector yield signals for the priority pipeline.
 * Pinch runs before other manipulators; while pinch is active the engine
 * never calls lower-priority detectors, so pinch must flag a pending reset.
 */
let manipulatorYieldPending = false;

export function signalManipulatorYieldsToPinch(): void {
  manipulatorYieldPending = true;
}

export function manipulatorShouldYieldToPinch(): boolean {
  if (!manipulatorYieldPending) {
    return false;
  }

  manipulatorYieldPending = false;
  return true;
}
