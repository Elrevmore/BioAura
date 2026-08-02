import { useContext } from 'react';
import { HandTrackingContext } from '../context/HandTrackingContext';
import type { HandTrackingContextValue } from '../context/HandTrackingContext';

export function useHandTracking(): HandTrackingContextValue {
  const context = useContext(HandTrackingContext);
  if (!context) {
    throw new Error('useHandTracking must be used within a HandTrackingProvider');
  }
  return context;
}
