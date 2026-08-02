export { CameraFeed } from './components/CameraFeed';
export { CameraOverlay } from './components/CameraOverlay';
export { CameraErrorState, CameraLoadingState } from './components/CameraStatus';

export { CameraProvider } from './context/CameraProvider';
export { useCamera } from './hooks/useCamera';
export { useWebcam } from './hooks/useWebcam';

export type {
  UseWebcamOptions,
  UseWebcamReturn,
  WebcamConstraints,
  WebcamError,
  WebcamErrorCode,
  WebcamState,
  WebcamStatus,
} from './types/camera.types';
