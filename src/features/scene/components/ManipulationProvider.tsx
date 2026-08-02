import { useGestures } from '@features/gestures';
import { useHandTracking } from '@features/hand-tracking';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, type MutableRefObject, type ReactNode } from 'react';
import {
  DEFAULT_MANIPULATION_STATE,
  ManipulationContext,
} from '../context/ManipulationContext';
import {
  GestureProteinController,
  type ManipulationState,
} from '../core/GestureProteinController';
import { useSceneManager } from '../hooks/useSceneManager';

interface ManipulationProviderProps {
  children: ReactNode;
}

interface ManipulationRunnerProps {
  manipulationRef: MutableRefObject<ManipulationState>;
}

/**
 * Isolated runner for the gesture → protein loop.
 * Re-renders on gesture/tracking updates without re-rendering scene children.
 */
function ManipulationRunner({ manipulationRef }: ManipulationRunnerProps) {
  const manager = useSceneManager();
  const { gestureRef } = useGestures();
  const { resultRef, mirrored, status: trackingStatus } = useHandTracking();
  const controllerRef = useRef(new GestureProteinController());

  useEffect(() => {
    if (trackingStatus !== 'active') {
      controllerRef.current.reset();
      manipulationRef.current = DEFAULT_MANIPULATION_STATE;
    }
  }, [manipulationRef, trackingStatus]);

  useEffect(() => {
    return manager.subscribeReset(() => {
      controllerRef.current.reset();
      manipulationRef.current = DEFAULT_MANIPULATION_STATE;
    });
  }, [manager, manipulationRef]);

  useFrame(() => {
    const gesture = gestureRef.current;
    if (!gesture || trackingStatus !== 'active') return;

    const hands = resultRef.current?.hands ?? [];
    manipulationRef.current = controllerRef.current.update(
      gesture,
      hands,
      manager,
      mirrored,
    );
  });

  return null;
}

/**
 * Provides manipulation state ref and runs the gesture → protein control loop.
 * Must be mounted inside the R3F canvas and GestureProvider tree.
 */
export function ManipulationProvider({ children }: ManipulationProviderProps) {
  const manipulationRef = useRef<ManipulationState>(DEFAULT_MANIPULATION_STATE);

  return (
    <ManipulationContext.Provider value={manipulationRef}>
      <ManipulationRunner manipulationRef={manipulationRef} />
      {children}
    </ManipulationContext.Provider>
  );
}
