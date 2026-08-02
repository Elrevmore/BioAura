import type { RefObject } from 'react';
import { createContext } from 'react';
import type { GestureEvent } from '@shared/types';

export interface GestureContextValue {
  activeGesture: GestureEvent;
  gestureRef: RefObject<GestureEvent | null>;
  history: GestureEvent[];
}

export const GestureContext = createContext<GestureContextValue | null>(null);
