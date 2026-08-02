import { useEffect, useState } from 'react';
import {
  handTrackingDiagnostics,
  type HandTrackingDiagnosticsSnapshot,
} from '../diagnostics/handTrackingDiagnostics';

/** Set to true to show the hand-tracking diagnostics overlay during development. */
export const SHOW_HAND_DIAGNOSTICS = false;

function StatusIcon({ ok }: { ok: boolean }) {
  return <span className={ok ? 'text-emerald-400' : 'text-red-400'}>{ok ? '✅' : '❌'}</span>;
}

/**
 * Temporary hand-tracking pipeline diagnostics (development).
 */
export function HandTrackingDiagnosticsPanel() {
  const [snapshot, setSnapshot] = useState<HandTrackingDiagnosticsSnapshot>(
    handTrackingDiagnostics.getSnapshot(),
  );

  useEffect(() => handTrackingDiagnostics.subscribe(setSnapshot), []);

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-20 max-w-[14rem] rounded-md border border-aura-border/60 bg-aura-bg/90 p-2 font-mono text-[9px] leading-relaxed text-aura-text shadow-lg">
      <p className="mb-1 text-[10px] font-semibold tracking-wide text-aura-cyan uppercase">
        Hand Tracking Diagnostics
      </p>
      <p>
        <StatusIcon ok={snapshot.camera} /> Camera
      </p>
      <p>
        <StatusIcon ok={snapshot.videoStream} /> Video Stream
      </p>
      <p>
        <StatusIcon ok={snapshot.videoReady} /> Video Ready ({snapshot.videoReadyState})
      </p>
      <p>
        <StatusIcon ok={snapshot.modelLoaded} /> Model Loaded
      </p>
      <p>
        <StatusIcon ok={snapshot.inferenceRunning} /> Inference Running
      </p>
      <p>Hands Detected: {snapshot.handsDetected}</p>
      <p>
        <StatusIcon ok={snapshot.drawingLandmarks} /> Drawing Landmarks
      </p>
      <p>FPS: {snapshot.fps.toFixed(1)}</p>
      <p>
        Video: {snapshot.videoWidth}x{snapshot.videoHeight}
        {snapshot.videoPaused ? ' (paused)' : ''}
      </p>
      <p>Canvas: {snapshot.canvasWidth}x{snapshot.canvasHeight}</p>
      <p>Landmarks drawn: {snapshot.landmarksDrawn}</p>
      <p>Inference frames: {snapshot.inferenceFrameCount}</p>
      {snapshot.lastError && (
        <p className="mt-1 break-words text-red-300">Last Error: {snapshot.lastError}</p>
      )}
    </div>
  );
}
