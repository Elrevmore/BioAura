import { createContext } from 'react';
import type { UseWebcamReturn } from '../types/camera.types';

export const CameraContext = createContext<UseWebcamReturn | null>(null);
