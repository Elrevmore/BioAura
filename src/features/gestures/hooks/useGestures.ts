import { useContext } from 'react';
import { GestureContext } from '../context/GestureContext';
import type { GestureContextValue } from '../context/GestureContext';

export function useGestures(): GestureContextValue {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGestures must be used within a GestureProvider');
  }
  return context;
}
