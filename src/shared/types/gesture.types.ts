export type GestureType =
  | 'pinch'
  | 'grab'
  | 'grab_rotate'
  | 'open_palm'
  | 'two_hand_zoom'
  | 'release'
  | 'none';

export interface GestureEvent {
  type: GestureType;
  confidence: number;
  timestamp: number;
  /** Normalized gesture parameters (scale delta, rotation axis, etc.) */
  payload?: Record<string, number>;
}

export interface GestureDetector {
  readonly name: GestureType;
  detect(hands: import('./hand.types').HandLandmarks[]): GestureEvent | null;
}
