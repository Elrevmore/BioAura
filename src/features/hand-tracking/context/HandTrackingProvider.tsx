import type { ReactNode } from 'react';
import { HandTrackingContext } from './HandTrackingContext';
import { useHandTracker } from '../hooks/useHandTracker';

interface HandTrackingProviderProps {
  children: ReactNode;
}

/**
 * Initializes MediaPipe hand tracking when the webcam stream is active.
 * Shares detection results via context for overlay and gesture modules.
 */
export function HandTrackingProvider({ children }: HandTrackingProviderProps) {
  const tracking = useHandTracker();

  return (
    <HandTrackingContext.Provider value={tracking}>
      {children}
    </HandTrackingContext.Provider>
  );
}
