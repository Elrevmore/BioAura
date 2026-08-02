/** MediaPipe hand landmark indices (21 points per hand) */
export const HAND_LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

export type HandLandmarkIndex = (typeof HAND_LANDMARK)[keyof typeof HAND_LANDMARK];

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandLandmarks {
  landmarks: Landmark[];
  handedness: 'Left' | 'Right';
  confidence: number;
}

export interface HandTrackingResult {
  hands: HandLandmarks[];
  timestamp: number;
  fps: number;
}
