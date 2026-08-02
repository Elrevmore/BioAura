import type { RefObject } from 'react';
import { createContext } from 'react';
import type { HandTrackingResult } from '@shared/types';
import type { HandTrackerStatus, HandTrackingStats } from '../types/hand-tracking.types';

export interface HandTrackingContextValue {
  status: HandTrackerStatus;
  error: string | null;
  stats: HandTrackingStats;
  /** Latest detection result — updated every frame, read via ref to avoid re-renders */
  resultRef: RefObject<HandTrackingResult | null>;
  mirrored: boolean;
}

export const HandTrackingContext = createContext<HandTrackingContextValue | null>(
  null,
);
