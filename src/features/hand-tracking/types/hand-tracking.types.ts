import { HAND_TRACKING_CONFIG } from '@shared/config';
import { resolveHttpsAssetUrl } from '@shared/utils';

const DEFAULT_MEDIAPIPE_WASM =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';
const DEFAULT_MEDIAPIPE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

/** MediaPipe Tasks Vision asset URLs */
export const MEDIAPIPE_ASSETS = {
  wasmPath: resolveHttpsAssetUrl(
    import.meta.env.VITE_MEDIAPIPE_WASM,
    DEFAULT_MEDIAPIPE_WASM,
    ['cdn.jsdelivr.net'],
  ),
  modelPath: resolveHttpsAssetUrl(
    import.meta.env.VITE_MEDIAPIPE_HAND_MODEL,
    DEFAULT_MEDIAPIPE_MODEL,
    ['storage.googleapis.com'],
  ),
} as const;

export interface HandTrackerOptions {
  maxNumHands: number;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
  minPresenceConfidence: number;
  delegate: 'GPU' | 'CPU';
}

export const DEFAULT_HAND_TRACKER_OPTIONS: HandTrackerOptions = {
  maxNumHands: HAND_TRACKING_CONFIG.maxNumHands,
  minDetectionConfidence: HAND_TRACKING_CONFIG.minDetectionConfidence,
  minTrackingConfidence: HAND_TRACKING_CONFIG.minTrackingConfidence,
  minPresenceConfidence: HAND_TRACKING_CONFIG.minTrackingConfidence,
  delegate: 'GPU',
};

export type HandTrackerStatus = 'idle' | 'loading' | 'active' | 'error';

export interface HandTrackerError {
  message: string;
}

export interface HandTrackingStats {
  fps: number;
  handCount: number;
}
