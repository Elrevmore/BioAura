import { useContext } from 'react';
import { CameraContext } from '../context/CameraContext';
import type { UseWebcamReturn } from '../types/camera.types';

export function useCamera(): UseWebcamReturn {
  const camera = useContext(CameraContext);
  if (!camera) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return camera;
}
