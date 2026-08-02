import type { RefObject } from 'react';
import { useContext } from 'react';
import {
  DEFAULT_MANIPULATION_STATE,
  ManipulationContext,
} from '../context/ManipulationContext';
import type { ManipulationState } from '../core/GestureProteinController';

/**
 * Reads manipulation state from a ref updated every frame.
 * Use inside R3F components — does not trigger React re-renders.
 */
export function useManipulationRef(): RefObject<ManipulationState> {
  const ref = useContext(ManipulationContext);
  if (!ref) {
    throw new Error('useManipulationRef must be used within ManipulationProvider');
  }
  return ref;
}

/** Convenience accessor for current manipulation snapshot */
export function useManipulationSnapshot(): ManipulationState {
  const ref = useManipulationRef();
  return ref.current ?? DEFAULT_MANIPULATION_STATE;
}
