export interface HandTrackingDiagnosticsSnapshot {
  camera: boolean;
  videoStream: boolean;
  videoReady: boolean;
  videoReadyState: number;
  videoPaused: boolean;
  videoWidth: number;
  videoHeight: number;
  videoCurrentTime: number;
  modelLoaded: boolean;
  inferenceRunning: boolean;
  handsDetected: number;
  drawingLandmarks: boolean;
  fps: number;
  inferenceFrameCount: number;
  drawFrameCount: number;
  canvasWidth: number;
  canvasHeight: number;
  landmarksDrawn: number;
  lastError: string | null;
  lastInferenceSummary: string;
}

const INITIAL: HandTrackingDiagnosticsSnapshot = {
  camera: false,
  videoStream: false,
  videoReady: false,
  videoReadyState: 0,
  videoPaused: true,
  videoWidth: 0,
  videoHeight: 0,
  videoCurrentTime: 0,
  modelLoaded: false,
  inferenceRunning: false,
  handsDetected: 0,
  drawingLandmarks: false,
  fps: 0,
  inferenceFrameCount: 0,
  drawFrameCount: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  landmarksDrawn: 0,
  lastError: null,
  lastInferenceSummary: 'idle',
};

type Listener = (snapshot: HandTrackingDiagnosticsSnapshot) => void;

class HandTrackingDiagnosticsStore {
  private snapshot: HandTrackingDiagnosticsSnapshot = { ...INITIAL };
  private listeners = new Set<Listener>();
  private lastConsoleLogAt = 0;

  getSnapshot(): HandTrackingDiagnosticsSnapshot {
    return this.snapshot;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  patch(update: Partial<HandTrackingDiagnosticsSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...update };
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }

  reportError(stage: string, error: unknown): void {
    const message =
      error instanceof Error
        ? `${stage}: ${error.message}\n${error.stack ?? ''}`
        : `${stage}: ${String(error)}`;
    this.patch({ lastError: message });
    console.error(`[HandTracking:${stage}]`, error);
  }

  maybeLogPipelineStatus(): void {
    if (!import.meta.env.DEV) return;

    const now = performance.now();
    if (now - this.lastConsoleLogAt < 3000) return;
    this.lastConsoleLogAt = now;

    const s = this.snapshot;
    console.info('[HandTracking:pipeline]', {
      camera: s.camera,
      videoStream: s.videoStream,
      videoReady: s.videoReady,
      videoReadyState: s.videoReadyState,
      videoPaused: s.videoPaused,
      videoSize: `${s.videoWidth}x${s.videoHeight}`,
      videoCurrentTime: s.videoCurrentTime.toFixed(3),
      modelLoaded: s.modelLoaded,
      inferenceRunning: s.inferenceRunning,
      inferenceFrames: s.inferenceFrameCount,
      handsDetected: s.handsDetected,
      drawingLandmarks: s.drawingLandmarks,
      canvasSize: `${s.canvasWidth}x${s.canvasHeight}`,
      landmarksDrawn: s.landmarksDrawn,
      fps: s.fps,
      lastInferenceSummary: s.lastInferenceSummary,
      lastError: s.lastError,
    });
  }

  reset(): void {
    this.snapshot = { ...INITIAL };
    for (const listener of this.listeners) {
      listener(this.snapshot);
    }
  }
}

export const handTrackingDiagnostics = new HandTrackingDiagnosticsStore();
