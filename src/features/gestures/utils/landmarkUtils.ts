import { GESTURE_CONFIG } from '@shared/config';
import {
  HAND_LANDMARK,
  type HandLandmarkIndex,
  type HandLandmarks,
  type Landmark,
} from '@shared/types';
import { distance3D } from '@shared/utils';

type FingerKey = 'index' | 'middle' | 'ring' | 'pinky';

const FINGER_LANDMARKS: Record<
  FingerKey,
  { tip: HandLandmarkIndex; pip: HandLandmarkIndex; mcp: HandLandmarkIndex }
> = {
  index: {
    tip: HAND_LANDMARK.INDEX_TIP,
    pip: HAND_LANDMARK.INDEX_PIP,
    mcp: HAND_LANDMARK.INDEX_MCP,
  },
  middle: {
    tip: HAND_LANDMARK.MIDDLE_TIP,
    pip: HAND_LANDMARK.MIDDLE_PIP,
    mcp: HAND_LANDMARK.MIDDLE_MCP,
  },
  ring: {
    tip: HAND_LANDMARK.RING_TIP,
    pip: HAND_LANDMARK.RING_PIP,
    mcp: HAND_LANDMARK.RING_MCP,
  },
  pinky: {
    tip: HAND_LANDMARK.PINKY_TIP,
    pip: HAND_LANDMARK.PINKY_PIP,
    mcp: HAND_LANDMARK.PINKY_MCP,
  },
};

export const FINGER_KEYS: FingerKey[] = ['index', 'middle', 'ring', 'pinky'];

export function getLandmark(
  hand: HandLandmarks,
  index: HandLandmarkIndex,
): Landmark {
  return hand.landmarks[index];
}

export function palmCenter(hand: HandLandmarks): Landmark {
  const wrist = getLandmark(hand, HAND_LANDMARK.WRIST);
  const indexMcp = getLandmark(hand, HAND_LANDMARK.INDEX_MCP);
  const pinkyMcp = getLandmark(hand, HAND_LANDMARK.PINKY_MCP);

  return {
    x: (wrist.x + indexMcp.x + pinkyMcp.x) / 3,
    y: (wrist.y + indexMcp.y + pinkyMcp.y) / 3,
    z: (wrist.z + indexMcp.z + pinkyMcp.z) / 3,
  };
}

export function pinchDistance(hand: HandLandmarks): number {
  const thumbTip = getLandmark(hand, HAND_LANDMARK.THUMB_TIP);
  const indexTip = getLandmark(hand, HAND_LANDMARK.INDEX_TIP);
  return distance3D(thumbTip, indexTip);
}

export function hasTrackingConfidence(
  hand: HandLandmarks,
  minConfidence = GESTURE_CONFIG.minHandConfidence,
): boolean {
  return hand.confidence >= minConfidence;
}

export function isPinchActive(
  hand: HandLandmarks,
  threshold = GESTURE_CONFIG.pinchDistanceThreshold,
): boolean {
  return pinchDistance(hand) < threshold;
}

/** Pinch still considered held — uses hysteresis exit threshold */
export function isPinchHeld(hand: HandLandmarks): boolean {
  return pinchDistance(hand) < GESTURE_CONFIG.pinchReleaseThreshold;
}

export function fingerExtensionRatio(hand: HandLandmarks, finger: FingerKey): number {
  const { tip, pip } = FINGER_LANDMARKS[finger];
  const wrist = getLandmark(hand, HAND_LANDMARK.WRIST);
  const tipLm = getLandmark(hand, tip);
  const pipLm = getLandmark(hand, pip);
  const pipDist = distance3D(wrist, pipLm);

  if (pipDist < 0.001) return 0;

  return distance3D(wrist, tipLm) / pipDist;
}

export function isFingerCurled(hand: HandLandmarks, finger: FingerKey): boolean {
  return fingerExtensionRatio(hand, finger) < GESTURE_CONFIG.grabCurledRatio;
}

export function countCurledFingers(hand: HandLandmarks): number {
  return FINGER_KEYS.reduce(
    (count, finger) => count + (isFingerCurled(hand, finger) ? 1 : 0),
    0,
  );
}

export function isOpenHandPose(
  hand: HandLandmarks,
  minExtended = GESTURE_CONFIG.openHandMinExtendedFingers,
): boolean {
  return (
    !isPinchActive(hand) &&
    countExtendedFingers(hand) >= minExtended
  );
}

const MIN_CURLED_FOR_GRAB = 3;

/** Closed-fist pose — at most one extended finger and at least three curled. */
export function isGrabPose(
  hand: HandLandmarks,
  minCurled = MIN_CURLED_FOR_GRAB,
): boolean {
  return (
    countExtendedFingers(hand) <= 1 && countCurledFingers(hand) >= minCurled
  );
}

export function isFingerExtended(hand: HandLandmarks, finger: FingerKey): number {
  const { tip, pip, mcp } = FINGER_LANDMARKS[finger];
  const wrist = getLandmark(hand, HAND_LANDMARK.WRIST);
  const tipLm = getLandmark(hand, tip);
  const pipLm = getLandmark(hand, pip);
  const mcpLm = getLandmark(hand, mcp);

  const tipDist = distance3D(wrist, tipLm);
  const pipDist = distance3D(wrist, pipLm);
  const mcpDist = distance3D(wrist, mcpLm);

  if (pipDist < 0.001) return 0;

  const extensionRatio = tipDist / pipDist;
  const spreadRatio = tipDist / Math.max(mcpDist, 0.001);

  const extensionScore =
    extensionRatio >= GESTURE_CONFIG.fingerExtendedRatio ? 1 : 0;
  const spreadScore = spreadRatio >= GESTURE_CONFIG.fingerExtendedRatio ? 1 : 0;

  return (extensionScore + spreadScore) / 2;
}

export function countExtendedFingers(hand: HandLandmarks): number {
  return FINGER_KEYS.reduce(
    (count, finger) => count + (isFingerExtended(hand, finger) > 0.5 ? 1 : 0),
    0,
  );
}

export function handPalmAngle(hand: HandLandmarks): number {
  const wrist = getLandmark(hand, HAND_LANDMARK.WRIST);
  const middleMcp = getLandmark(hand, HAND_LANDMARK.MIDDLE_MCP);
  return Math.atan2(middleMcp.y - wrist.y, middleMcp.x - wrist.x);
}

/**
 * Wrist-roll angle for grab+twist: wrist→middle MCP in the XZ (horizontal–depth) plane.
 * MediaPipe landmarks use normalized image x (right), y (down), and z (depth; smaller = nearer).
 */
export function handGrabTwistAngle(hand: HandLandmarks): number {
  const wrist = getLandmark(hand, HAND_LANDMARK.WRIST);
  const middleMcp = getLandmark(hand, HAND_LANDMARK.MIDDLE_MCP);
  const dx = middleMcp.x - wrist.x;
  const dz = middleMcp.z - wrist.z;
  return Math.atan2(dz, dx);
}

export function handsPalmDistance(hands: HandLandmarks[]): number {
  if (hands.length < 2) return 0;
  return distance3D(palmCenter(hands[0]), palmCenter(hands[1]));
}

export function normalizeAngleDelta(delta: number): number {
  let normalized = delta;
  while (normalized > Math.PI) normalized -= 2 * Math.PI;
  while (normalized < -Math.PI) normalized += 2 * Math.PI;
  return normalized;
}

/** Exponential smoothing for circular palm angles */
export function smoothAngle(prev: number, next: number, alpha: number): number {
  const delta = normalizeAngleDelta(next - prev);
  return prev + alpha * delta;
}
