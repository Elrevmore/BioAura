import type { RefObject } from 'react';

/** Webcam lifecycle status */
export type WebcamStatus = 'idle' | 'requesting' | 'active' | 'error';

export type WebcamErrorCode =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'Unknown';

export interface WebcamError {
  code: WebcamErrorCode;
  message: string;
}

export interface WebcamConstraints {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
  frameRate: number;
}

export interface WebcamState {
  status: WebcamStatus;
  stream: MediaStream | null;
  error: WebcamError | null;
}

export interface UseWebcamOptions {
  constraints?: Partial<WebcamConstraints>;
  autoStart?: boolean;
}

export interface UseWebcamReturn {
  videoRef: RefObject<HTMLVideoElement | null>;
  state: WebcamState;
  start: () => Promise<void>;
  stop: () => void;
  retry: () => Promise<void>;
}
