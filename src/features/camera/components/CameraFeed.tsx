import { CAMERA_CONFIG } from '@shared/config';
import { useCamera } from '../hooks/useCamera';
import { CameraErrorState, CameraLoadingState } from './CameraStatus';

interface CameraFeedProps {
  mirrored?: boolean;
  className?: string;
}

/**
 * Live webcam video element.
 * The same video ref is shared with hand tracking in Phase 4.
 */
export function CameraFeed({
  mirrored = CAMERA_CONFIG.mirrored,
  className = '',
}: CameraFeedProps) {
  const { videoRef, state, retry } = useCamera();

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
        playsInline
        muted
        autoPlay
        aria-label="Live camera feed"
      />

      {state.status === 'requesting' && (
        <div className="absolute inset-0 bg-aura-bg/80">
          <CameraLoadingState />
        </div>
      )}

      {state.status === 'error' && (
        <div className="absolute inset-0 bg-aura-bg/90">
          <CameraErrorState onRetry={retry} />
        </div>
      )}

      {state.status === 'idle' && (
        <div className="absolute inset-0 bg-aura-bg/80">
          <CameraLoadingState label="Initializing camera…" />
        </div>
      )}
    </div>
  );
}
