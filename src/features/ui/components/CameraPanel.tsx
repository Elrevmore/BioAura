import { CameraOverlay } from '@features/camera';
import { HandTrackingOverlay, useHandTracking } from '@features/hand-tracking';
import { useCamera } from '@features/camera';

/**
 * Composes camera feed with hand-tracking overlay.
 * Lives in UI layer to avoid cross-feature dependencies.
 */
export function CameraPanel() {
  const { state } = useCamera();
  const { status: trackingStatus } = useHandTracking();
  const isCameraActive = state.status === 'active';
  const isTracking = trackingStatus === 'active';

  return (
    <CameraOverlay
      trackingActive={isTracking}
      overlay={isCameraActive ? <HandTrackingOverlay /> : null}
    />
  );
}
