import { createContext, type RefObject } from 'react';
import type { ManipulationState } from '../core/GestureProteinController';

export const DEFAULT_MANIPULATION_STATE: ManipulationState = {
  isActive: false,
  activeGesture: 'none',
};

export const ManipulationContext = createContext<RefObject<ManipulationState> | null>(
  null,
);
