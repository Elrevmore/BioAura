import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCamera } from '@features/camera';
import { CAMERA_CONFIG, PERFORMANCE_CONFIG } from '@shared/config';
import type { HandTrackingResult } from '@shared/types';
import { FpsCounter } from '@shared/utils';
import type { HandTracker } from '../core/HandTracker';
import { handTrackingDiagnostics } from '../diagnostics/handTrackingDiagnostics';
import type { HandTrackerStatus, HandTrackingStats } from '../types/hand-tracking.types';

const EMPTY_HANDS: HandTrackingResult['hands'] = [];

function emptyResult(timestamp: number, fps = 0): HandTrackingResult {
  return { hands: EMPTY_HANDS, timestamp, fps };
}

interface UseHandTrackerReturn {
  status: HandTrackerStatus;
  error: string | null;
  stats: HandTrackingStats;
  resultRef: RefObject<HandTrackingResult | null>;
  mirrored: boolean;
}

interface VideoFrameVideoElement {
  requestVideoFrameCallback?(
    callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => void,
  ): number;
  cancelVideoFrameCallback?(handle: number): void;
}

function asVideoFrameVideoElement(video: HTMLVideoElement | null): HTMLVideoElement & VideoFrameVideoElement {
  return video as HTMLVideoElement & VideoFrameVideoElement;
}

async function createHandTracker(): Promise<HandTracker> {
  const { HandTracker: Tracker } = await import('../core/HandTracker');
  return new Tracker();
}

function updateVideoDiagnostics(video: HTMLVideoElement | null, cameraActive: boolean): void {
  handTrackingDiagnostics.patch({
    camera: cameraActive,
    videoStream: Boolean(video?.srcObject),
    videoReady: (video?.readyState ?? 0) >= HTMLMediaElement.HAVE_ENOUGH_DATA,
    videoReadyState: video?.readyState ?? 0,
    videoPaused: video?.paused ?? true,
    videoWidth: video?.videoWidth ?? 0,
    videoHeight: video?.videoHeight ?? 0,
    videoCurrentTime: video?.currentTime ?? 0,
  });
}

async function ensureVideoPlaying(video: HTMLVideoElement): Promise<void> {
  if (!video.paused) return;

  try {
    await video.play();
  } catch (error) {
    handTrackingDiagnostics.reportError('camera-play', error);
  }
}

/**
 * Runs MediaPipe detection on incoming camera frames.
 * HandTracker is lazy-loaded to keep the initial bundle small.
 */
export function useHandTracker(): UseHandTrackerReturn {
  const { videoRef, state: cameraState } = useCamera();
  const resultRef = useRef<HandTrackingResult | null>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const fpsCounterRef = useRef(new FpsCounter());
  const lastStatsUpdateRef = useRef(0);
  const frameBudgetRef = useRef(0);
  const inferenceFrameCountRef = useRef(0);

  const [status, setStatus] = useState<HandTrackerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<HandTrackingStats>({ fps: 0, handCount: 0 });

  const updateStats = useCallback((fps: number, handCount: number) => {
    setStats((prev) => {
      if (prev.fps === fps && prev.handCount === handCount) {
        return prev;
      }
      return { fps, handCount };
    });
    handTrackingDiagnostics.patch({ fps, handsDetected: handCount });
  }, []);

  useEffect(() => {
    const cameraActive = cameraState.status === 'active';
    updateVideoDiagnostics(videoRef.current, cameraActive);

    if (!cameraActive) {
      handTrackingDiagnostics.patch({
        modelLoaded: false,
        inferenceRunning: false,
        inferenceFrameCount: 0,
      });
      return;
    }

    let disposed = false;

    async function startTracking() {
      setStatus('loading');
      setError(null);
      handTrackingDiagnostics.patch({ lastError: null });

      try {
        const tracker = await createHandTracker();

        if (disposed) {
          tracker.dispose();
          return;
        }

        await tracker.initialize();
        handTrackingDiagnostics.patch({ modelLoaded: true });

        if (disposed) {
          tracker.dispose();
          return;
        }

        trackerRef.current = tracker;
        setStatus('active');
        fpsCounterRef.current.reset();
        lastStatsUpdateRef.current = 0;
        frameBudgetRef.current = 0;
        inferenceFrameCountRef.current = 0;
        resultRef.current = null;
        handTrackingDiagnostics.patch({ inferenceRunning: true, inferenceFrameCount: 0 });
      } catch (err) {
        if (disposed) return;
        handTrackingDiagnostics.reportError('model-init', err);
        const message =
          err instanceof Error ? err.message : 'Failed to initialize hand tracking';
        setError(message);
        setStatus('error');
        trackerRef.current?.dispose();
        trackerRef.current = null;
        handTrackingDiagnostics.patch({ modelLoaded: false, inferenceRunning: false });
      }
    }

    void startTracking();

    return () => {
      disposed = true;
      trackerRef.current?.dispose();
      trackerRef.current = null;
      resultRef.current = null;
      setStatus('idle');
      setStats({ fps: 0, handCount: 0 });
      handTrackingDiagnostics.patch({
        modelLoaded: false,
        inferenceRunning: false,
        inferenceFrameCount: 0,
        handsDetected: 0,
        fps: 0,
      });
    };
  }, [cameraState.status, videoRef]);

  useEffect(() => {
    if (status !== 'active') return;

    let disposed = false;
    let frameHandle = 0;
    const minFrameMs = 1000 / PERFORMANCE_CONFIG.handTrackingTargetFps;
    const videoElement = videoRef.current;

    const runInference = async (frameTime: number) => {
      if (disposed) return;

      const tracker = trackerRef.current;
      const video = videoRef.current;

      updateVideoDiagnostics(video, cameraState.status === 'active');

      if (!tracker || !video) {
        handTrackingDiagnostics.patch({ inferenceRunning: false });
        scheduleNextFrame();
        return;
      }

      try {
        if (video.paused) {
          await ensureVideoPlaying(video);
        }

        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          resultRef.current = emptyResult(frameTime);
          scheduleNextFrame();
          return;
        }

        if (frameTime - frameBudgetRef.current < minFrameMs) {
          scheduleNextFrame();
          return;
        }

        frameBudgetRef.current = frameTime;

        const timestampMs = Math.round(performance.now());
        const fps = fpsCounterRef.current.tick(frameTime);
        const detection = tracker.detect(video, timestampMs);

        inferenceFrameCountRef.current += 1;

        if (detection) {
          detection.fps = fps;
          resultRef.current = detection;

          const landmarkCount = detection.hands.reduce(
            (total, hand) => total + hand.landmarks.length,
            0,
          );
          handTrackingDiagnostics.patch({
            inferenceFrameCount: inferenceFrameCountRef.current,
            handsDetected: detection.hands.length,
            lastInferenceSummary: `landmarks=${landmarkCount} handedness=${detection.hands
              .map((hand) => hand.handedness)
              .join(',')}`,
          });
        } else {
          resultRef.current = emptyResult(timestampMs, fps);
          handTrackingDiagnostics.patch({
            inferenceFrameCount: inferenceFrameCountRef.current,
            handsDetected: 0,
            lastInferenceSummary: 'detect() returned null',
          });
        }

        if (frameTime - lastStatsUpdateRef.current >= PERFORMANCE_CONFIG.statsUpdateIntervalMs) {
          lastStatsUpdateRef.current = frameTime;
          updateStats(fps, resultRef.current.hands.length);
          handTrackingDiagnostics.maybeLogPipelineStatus();
        }
      } catch (err) {
        handTrackingDiagnostics.reportError('inference', err);
      }

      scheduleNextFrame();
    };

    const scheduleNextFrame = () => {
      if (disposed) return;

      const video = videoRef.current;
      if (!video) {
        frameHandle = window.requestAnimationFrame(runInference);
        return;
      }

      const frameVideo = asVideoFrameVideoElement(video);
      if (typeof frameVideo.requestVideoFrameCallback === 'function') {
        frameHandle = frameVideo.requestVideoFrameCallback(() => {
          void runInference(performance.now());
        });
        return;
      }

      frameHandle = window.requestAnimationFrame(runInference);
    };

    scheduleNextFrame();

    return () => {
      disposed = true;
      if (videoElement) {
        const frameVideo = asVideoFrameVideoElement(videoElement);
        if (typeof frameVideo.cancelVideoFrameCallback === 'function') {
          frameVideo.cancelVideoFrameCallback(frameHandle);
        } else {
          window.cancelAnimationFrame(frameHandle);
        }
      } else {
        window.cancelAnimationFrame(frameHandle);
      }
      handTrackingDiagnostics.patch({ inferenceRunning: false });
    };
  }, [cameraState.status, status, updateStats, videoRef]);

  return {
    status,
    error,
    stats,
    resultRef,
    mirrored: CAMERA_CONFIG.mirrored,
  };
}
