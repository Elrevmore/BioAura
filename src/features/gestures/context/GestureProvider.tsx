import type { ReactNode } from 'react';
import { GestureContext } from './GestureContext';
import { useGestureDetection } from '../hooks/useGestureDetection';

interface GestureProviderProps {
  children: ReactNode;
}

export function GestureProvider({ children }: GestureProviderProps) {
  const gestures = useGestureDetection();

  return (
    <GestureContext.Provider value={gestures}>{children}</GestureContext.Provider>
  );
}
