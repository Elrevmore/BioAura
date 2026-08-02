import { useHandTracking } from '../hooks/useHandTracking';
import { StatusBadge } from '@shared/components';
import { HandLandmarkCanvas } from './HandLandmarkCanvas';
import {
  HandTrackingDiagnosticsPanel,
  SHOW_HAND_DIAGNOSTICS,
} from './HandTrackingDiagnosticsPanel';

/**
 * Hand tracking visualization layer — mounts over the camera feed.
 */
export function HandTrackingOverlay() {
  const { status, stats } = useHandTracking();
  const isActive = status === 'active';

  return (
    <>
      <HandLandmarkCanvas />
      {SHOW_HAND_DIAGNOSTICS && <HandTrackingDiagnosticsPanel />}

      {isActive && (
        <div className="pointer-events-none absolute top-2 right-2 flex flex-col items-end gap-1">
          <StatusBadge label={`${stats.fps} FPS`} tone="cyan" />
          <StatusBadge
            label={`${stats.handCount} hand${stats.handCount !== 1 ? 's' : ''}`}
            tone="violet"
          />
        </div>
      )}
    </>
  );
}
