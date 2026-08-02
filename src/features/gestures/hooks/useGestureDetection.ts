import { useHandTracking } from '@features/hand-tracking';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { LOOP_PRIORITY, PERFORMANCE_CONFIG } from '@shared/config';
import { animationLoop } from '@shared/lib';
import type { GestureEvent } from '@shared/types';
import { GestureEngine } from '../core/GestureEngine';

const NONE_GESTURE: GestureEvent = {
  type: 'none',
  confidence: 1,
  timestamp: 0,
};

const HISTORY_LIMIT = 20;

/**
 * Gesture detection on the shared animation loop (tier 1).
 */
export function useGestureDetection(): import('../context/GestureContext').GestureContextValue {
  const { resultRef, status } = useHandTracking();
  const engineRef = useRef(new GestureEngine());
  const gestureRef = useRef<GestureEvent | null>(NONE_GESTURE);
  const lastUiUpdateRef = useRef(0);
  const [activeGesture, setActiveGesture] = useState<GestureEvent>(NONE_GESTURE);
  const [history, setHistory] = useState<GestureEvent[]>([]);

  useEffect(() => {
    if (status !== 'active') {
      engineRef.current.reset();
      gestureRef.current = NONE_GESTURE;
      setActiveGesture(NONE_GESTURE);
      return;
    }

    const engine = engineRef.current;

    const unsubscribe = animationLoop.subscribe((now) => {
      const tracking = resultRef.current;
      const hands = tracking?.hands ?? [];
      const timestamp = tracking?.timestamp ?? now;

      const gesture = engine.detect(hands, timestamp);
      gestureRef.current = gesture;

      if (now - lastUiUpdateRef.current >= PERFORMANCE_CONFIG.gestureUiUpdateIntervalMs) {
        lastUiUpdateRef.current = now;
        setActiveGesture(gesture);

        if (gesture.type !== 'none') {
          setHistory((prev) => {
            const last = prev[0];
            if (last?.type === gesture.type && last.timestamp === gesture.timestamp) {
              return prev;
            }
            return [gesture, ...prev].slice(0, HISTORY_LIMIT);
          });
        }
      }
    }, LOOP_PRIORITY.GESTURE);

    return () => {
      unsubscribe();
      engine.reset();
    };
  }, [resultRef, status]);

  return {
    activeGesture,
    gestureRef: gestureRef as RefObject<GestureEvent | null>,
    history,
  };
}
