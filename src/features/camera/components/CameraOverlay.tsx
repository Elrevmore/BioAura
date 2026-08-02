import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { HudPanelHeader, StatusBadge } from '@shared/components';
import { useCamera } from '../hooks/useCamera';
import { CameraFeed } from './CameraFeed';

interface CameraOverlayProps {
  className?: string;
  overlay?: ReactNode;
  trackingActive?: boolean;
}

/**
 * Picture-in-picture webcam overlay with holographic glass frame.
 */
export function CameraOverlay({
  className = '',
  overlay,
  trackingActive = false,
}: CameraOverlayProps) {
  const { state } = useCamera();
  const isActive = state.status === 'active';

  return (
    <motion.div
      className={`pointer-events-auto absolute right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 w-52 overflow-hidden sm:right-6 sm:bottom-6 sm:w-64 ${className}`}
      initial={{ opacity: 0, x: 20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      aria-label="Camera feed overlay"
    >
      <div className="glass-panel-strong overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.06)]">
        <HudPanelHeader
          title="Live Feed"
          accent="cyan"
          trailing={
            <div className="flex items-center gap-1.5">
              {trackingActive && (
                <StatusBadge label="Track" tone="cyan" pulse />
              )}
              <StatusBadge
                label={isActive ? 'On' : state.status === 'error' ? 'Err' : '…'}
                tone={isActive ? 'success' : state.status === 'error' ? 'error' : 'neutral'}
                pulse={isActive}
              />
            </div>
          }
        />

        <div className="relative aspect-video w-full">
          <CameraFeed />
          {overlay}
        </div>
      </div>
    </motion.div>
  );
}
