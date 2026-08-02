import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CAMERA_CONFIG } from '@shared/config';
import type {
  UseWebcamOptions,
  UseWebcamReturn,
  WebcamConstraints,
  WebcamError,
  WebcamState,
} from '../types/camera.types';

const INITIAL_STATE: WebcamState = {
  status: 'idle',
  stream: null,
  error: null,
};

function resolveConstraints(
  overrides?: Partial<WebcamConstraints>,
): MediaStreamConstraints {
  const width = overrides?.width ?? CAMERA_CONFIG.width;
  const height = overrides?.height ?? CAMERA_CONFIG.height;
  const facingMode = overrides?.facingMode ?? CAMERA_CONFIG.facingMode;
  const frameRate = overrides?.frameRate ?? CAMERA_CONFIG.frameRate;

  return {
    audio: false,
    video: {
      width: { ideal: width },
      height: { ideal: height },
      facingMode: { ideal: facingMode },
      frameRate: { ideal: frameRate, max: frameRate },
    },
  };
}

function parseWebcamError(err: unknown): WebcamError {
  if (err instanceof DOMException) {
    const knownCodes = [
      'NotAllowedError',
      'NotFoundError',
      'NotReadableError',
      'OverconstrainedError',
    ] as const;

    const code = knownCodes.includes(err.name as (typeof knownCodes)[number])
      ? (err.name as WebcamError['code'])
      : 'Unknown';

    return { code, message: err.message };
  }

  if (err instanceof Error) {
    return { code: 'Unknown', message: err.message };
  }

  return { code: 'Unknown', message: 'Failed to access webcam' };
}

function stopStream(stream: MediaStream | null): void {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

/**
 * Manages webcam access via getUserMedia.
 * Exposes a video ref for display (Phase 3) and frame analysis (Phase 4).
 */
export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const { constraints: constraintOverrides, autoStart = true } = options;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef(false);
  const mountedRef = useRef(false);
  const [state, setState] = useState<WebcamState>(INITIAL_STATE);

  const attachStream = useCallback((stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay may be blocked until user gesture — non-fatal for dev
      });
    }
  }, []);

  const stop = useCallback(() => {
    activeRef.current = false;
    stopStream(streamRef.current);
    streamRef.current = null;

    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }

    setState(INITIAL_STATE);
  }, []);

  const start = useCallback(async () => {
    if (activeRef.current) {
      return;
    }

    if (!window.isSecureContext) {
      setState({
        status: 'error',
        stream: null,
        error: {
          code: 'Unknown',
          message: 'Camera access requires a secure context (HTTPS or localhost).',
        },
      });
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setState({
        status: 'error',
        stream: null,
        error: {
          code: 'Unknown',
          message: 'Camera API is not available in this browser.',
        },
      });
      return;
    }

    setState({ status: 'requesting', stream: null, error: null });

    try {
      const mediaConstraints = resolveConstraints(constraintOverrides);
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

      if (!mountedRef.current) {
        stopStream(stream);
        return;
      }

      streamRef.current = stream;
      activeRef.current = true;
      setState({ status: 'active', stream, error: null });
      attachStream(stream);
    } catch (err) {
      activeRef.current = false;
      const error = parseWebcamError(err);
      setState({ status: 'error', stream: null, error });
    }
  }, [attachStream, constraintOverrides]);

  const retry = useCallback(async () => {
    stop();
    await start();
  }, [start, stop]);

  // Re-attach when video element mounts after stream is already active
  useEffect(() => {
    if (state.status === 'active' && state.stream) {
      attachStream(state.stream);
    }
  }, [attachStream, state.status, state.stream]);

  // Pause capture when the tab is hidden — reduces passive exposure
  useEffect(() => {
    const onVisibilityChange = () => {
      const stream = streamRef.current;
      if (!stream) return;

      const enabled = !document.hidden;
      for (const track of stream.getVideoTracks()) {
        track.enabled = enabled;
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (autoStart) {
      void start();
    }

    return () => {
      mountedRef.current = false;
      activeRef.current = false;
      stopStream(streamRef.current);
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, []);

  return {
    videoRef: videoRef as RefObject<HTMLVideoElement | null>,
    state,
    start,
    stop,
    retry,
  };
}
