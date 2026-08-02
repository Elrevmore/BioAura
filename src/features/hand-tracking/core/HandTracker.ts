import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import type { HandLandmarks, HandTrackingResult, Landmark } from '@shared/types';
import {
  DEFAULT_HAND_TRACKER_OPTIONS,
  MEDIAPIPE_ASSETS,
  type HandTrackerOptions,
} from '../types/hand-tracking.types';
import { handTrackingDiagnostics } from '../diagnostics/handTrackingDiagnostics';

function parseHandedness(
  categories: HandLandmarkerResult['handednesses'],
  index: number,
): HandLandmarks['handedness'] {
  const label = categories[index]?.[0]?.categoryName;
  return label === 'Right' ? 'Right' : 'Left';
}

function parseConfidence(
  categories: HandLandmarkerResult['handednesses'],
  index: number,
): number {
  return categories[index]?.[0]?.score ?? 0;
}

function parseLandmarks(
  landmarks: HandLandmarkerResult['landmarks'],
  index: number,
): Landmark[] {
  const hand = landmarks[index];
  if (!hand) return [];

  return hand.map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z,
  }));
}

/**
 * Encapsulates MediaPipe HandLandmarker lifecycle and frame detection.
 * Runs in VIDEO mode for temporal tracking across frames.
 */
export class HandTracker {
  private landmarker: HandLandmarker | null = null;
  private disposed = false;
  private lastTimestamp = -1;

  get isReady(): boolean {
    return this.landmarker !== null && !this.disposed;
  }

  async initialize(
    options: HandTrackerOptions = DEFAULT_HAND_TRACKER_OPTIONS,
  ): Promise<void> {
    if (this.disposed) {
      throw new Error('HandTracker has been disposed');
    }

    try {
      await this.createLandmarker(options);
      handTrackingDiagnostics.patch({ modelLoaded: true });
    } catch (gpuError) {
      if (options.delegate !== 'GPU') {
        throw gpuError;
      }
      if (this.disposed) return;
      await this.createLandmarker({ ...options, delegate: 'CPU' });
      handTrackingDiagnostics.patch({ modelLoaded: true });
    }
  }

  detect(video: HTMLVideoElement, timestampMs: number): HandTrackingResult | null {
    if (!this.landmarker || this.disposed) {
      return null;
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null;
    }

    try {
      const timestamp = timestampMs <= this.lastTimestamp
        ? this.lastTimestamp + 1
        : timestampMs;
      this.lastTimestamp = timestamp;

      const result = this.landmarker.detectForVideo(video, timestamp);
      return this.parseResult(result, timestamp);
    } catch (error) {
      handTrackingDiagnostics.reportError('detectForVideo', error);
      return null;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.landmarker?.close();
    this.landmarker = null;
    this.lastTimestamp = -1;
  }

  private async createLandmarker(options: HandTrackerOptions): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_ASSETS.wasmPath);
    if (this.disposed) return;

    const landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MEDIAPIPE_ASSETS.modelPath,
        delegate: options.delegate,
      },
      runningMode: 'VIDEO',
      numHands: options.maxNumHands,
      minHandDetectionConfidence: options.minDetectionConfidence,
      minHandPresenceConfidence: options.minPresenceConfidence,
      minTrackingConfidence: options.minTrackingConfidence,
    });

    if (this.disposed) {
      landmarker.close();
      return;
    }

    this.landmarker = landmarker;
  }

  private parseResult(
    result: HandLandmarkerResult,
    timestamp: number,
  ): HandTrackingResult {
    const hands: HandLandmarks[] = [];

    for (let i = 0; i < result.landmarks.length; i++) {
      hands.push({
        landmarks: parseLandmarks(result.landmarks, i),
        handedness: parseHandedness(result.handednesses, i),
        confidence: parseConfidence(result.handednesses, i),
      });
    }

    return {
      hands,
      timestamp,
      fps: 0, // Filled by the detection loop
    };
  }
}
