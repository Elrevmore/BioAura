import { useCamera } from '@features/camera';
import { useGestures } from '@features/gestures';
import { useHandTracking } from '@features/hand-tracking';
import { useProtein } from '@features/protein';
import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';

/**
 * Compact system status strip across the top of the viewport.
 */
export function SystemStatusBar() {
  const { state: cameraState } = useCamera();
  const { status: trackingStatus, stats } = useHandTracking();
  const { status: proteinStatus } = useProtein();
  const { activeGesture } = useGestures();

  const cameraTone =
    cameraState.status === 'active'
      ? 'success'
      : cameraState.status === 'error'
        ? 'error'
        : 'neutral';

  const trackingTone = trackingStatus === 'active' ? 'cyan' : 'neutral';
  const proteinTone =
    proteinStatus === 'loaded'
      ? 'success'
      : proteinStatus === 'error'
        ? 'error'
        : proteinStatus === 'loading'
          ? 'warning'
          : 'neutral';

  return (
    <motion.div
      className="pointer-events-none absolute top-[4.5rem] right-0 left-0 z-10 flex justify-center px-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
    >
      <div className="glass-panel flex flex-wrap items-center justify-center gap-2 px-3 py-1.5">
        <StatusBadge
          label={cameraState.status === 'active' ? 'Camera' : 'Camera Off'}
          tone={cameraTone}
          pulse={cameraState.status === 'active'}
        />
        <StatusBadge
          label={
            trackingStatus === 'active'
              ? `Track ${stats.fps}fps`
              : 'Tracking'
          }
          tone={trackingTone}
          pulse={trackingStatus === 'active'}
        />
        <StatusBadge
          label={
            proteinStatus === 'loaded'
              ? 'Protein'
              : proteinStatus === 'loading'
                ? 'Loading PDB'
                : proteinStatus === 'error'
                  ? 'PDB Error'
                  : 'Protein'
          }
          tone={proteinTone}
          pulse={proteinStatus === 'loading'}
        />
        {activeGesture.type !== 'none' && (
          <StatusBadge
            label={activeGesture.type.replace(/_/g, ' ')}
            tone="violet"
            pulse
          />
        )}
      </div>
    </motion.div>
  );
}
