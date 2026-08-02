/** Application-wide configuration constants */
export const APP_CONFIG = {
  name: 'BioAura',
  tagline: 'Protein structures at your fingertips',
  version: '0.1.0',
} as const;

/** Default protein loaded on startup (Phase 6) */
export const DEFAULT_PROTEIN = {
  pdbId: '1HHO',
  name: 'Hemoglobin',
  organism: 'Homo sapiens',
} as const;

/** Webcam capture defaults — tuned for MediaPipe hand tracking (Phase 4) */
export const CAMERA_CONFIG = {
  width: 1280,
  height: 720,
  facingMode: 'user' as const,
  frameRate: 30,
  /** Mirror the feed horizontally for natural gesture interaction */
  mirrored: true,
} as const;

/** MediaPipe hand tracking configuration (Phase 4) */
export const HAND_TRACKING_CONFIG = {
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.6,
  targetFps: 30,
} as const;

/** Gesture detection thresholds (Phase 5) */
export const GESTURE_CONFIG = {
  pinchDistanceThreshold: 0.06,
  /** Hysteresis exit — must exceed pinch threshold before ending a pinch */
  pinchReleaseThreshold: 0.085,
  fingerExtendedRatio: 1.08,
  grabCurledRatio: 0.95,
  /** Consecutive fist-pose frames required before grab activates */
  grabEnterFrames: 2,
  /** Non-qualifying frames before an active grab releases */
  grabExitFrames: 3,
  openPalmMinExtendedFingers: 4,
  /** Consecutive qualifying frames before open_palm claims */
  openPalmEnterFrames: 3,
  /** Minimum extended fingers for open-hand pose checks */
  openHandMinExtendedFingers: 3,
  twoHandMinDistance: 0.08,
  /** Consecutive grab-pose frames before wrist rotation tracking arms */
  grabRotateGrabHoldFrames: 2,
  /** Minimum wrist angle delta to count as rotation */
  grabRotateMinDelta: 0.025,
  /** Consecutive wrist-movement frames before grab_rotate activates */
  grabRotateEnterFrames: 2,
  /** Still frames before grab_rotate releases */
  grabRotateExitFrames: 4,
  /** Consecutive grab-pose failures tolerated while rotating */
  grabRotatePoseFailureFrames: 3,
  /** Wrist angle EMA while grabbed */
  grabRotateAngleSmoothing: 0.4,
  /** Rotation delta EMA applied to scene output */
  grabRotateDeltaSmoothing: 0.5,
  zoomMinDelta: 0.004,
  zoomSmoothing: 0.85,
  releaseConfidenceThreshold: 0.6,
  minHandConfidence: 0.6,
} as const;

/** Gesture → protein transform sensitivities (Phase 7) */
export const GESTURE_CONTROL_CONFIG = {
  translateSensitivity: 12,
  rotateSensitivity: 1.8,
  zoomSensitivity: 8,
  minScale: 0.3,
  maxScale: 3,
  minPosition: -6,
  maxPosition: 6,
} as const;

/** Three.js scene defaults (Phase 2) */
export const SCENE_CONFIG = {
  backgroundColor: 0x050810,
  cameraFov: 45,
  cameraNear: 0.1,
  cameraFar: 1000,
  enableOrbitControlsInDev: import.meta.env.DEV,
} as const;

/** Performance tuning (Phase 9) */
export const PERFORMANCE_CONFIG = {
  statsUpdateIntervalMs: 500,
  gestureUiUpdateIntervalMs: 100,
  maxDevicePixelRatio: 2,
  overlayCanvasMaxDpr: 1.5,
  enablePerfOverlay: import.meta.env.DEV,
  handTrackingTargetFps: 30,
} as const;

/** Animation loop tier priorities — lower runs first */
export const LOOP_PRIORITY = {
  HAND_TRACKING: 0,
  GESTURE: 1,
  OVERLAY_DRAW: 2,
} as const;

export type LoopPriority = (typeof LOOP_PRIORITY)[keyof typeof LOOP_PRIORITY];

/** PDB fetch base URL */
export const PDB_BASE_URL = 'https://files.rcsb.org/download';

/** RCSB protein discovery (Phase: search) */
export const PROTEIN_SEARCH_CONFIG = {
  maxResults: 20,
  searchApiUrl: 'https://search.rcsb.org/rcsbsearch/v2/query',
  graphqlApiUrl: 'https://data.rcsb.org/graphql',
} as const;
