import type { ReactNode } from 'react';
import { CameraContext } from './CameraContext';
import { useWebcam } from '../hooks/useWebcam';
import type { UseWebcamOptions } from '../types/camera.types';

interface CameraProviderProps {
  children: ReactNode;
  options?: UseWebcamOptions;
}

/**
 * Provides a single shared webcam stream for the feed overlay (Phase 3)
 * and hand tracking (Phase 4).
 */
export function CameraProvider({ children, options }: CameraProviderProps) {
  const webcam = useWebcam(options);

  return (
    <CameraContext.Provider value={webcam}>{children}</CameraContext.Provider>
  );
}
