import { useEffect, useRef } from 'react';
import { LOOP_PRIORITY, PERFORMANCE_CONFIG } from '@shared/config';
import { animationLoop } from '@shared/lib';
import { handTrackingDiagnostics } from '../diagnostics/handTrackingDiagnostics';
import { useHandTracking } from '../hooks/useHandTracking';
import { drawHandLandmarks } from '../utils/drawLandmarks';

interface HandLandmarkCanvasProps {
  className?: string;
}

/**
 * Canvas overlay drawn on the shared animation loop (tier 2).
 * Canvas size tracked via ResizeObserver — not polled every frame.
 */
export function HandLandmarkCanvas({ className = '' }: HandLandmarkCanvasProps) {
  const { resultRef, mirrored, status } = useHandTracking();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const lastDrawnTimestampRef = useRef(-1);
  const clearedRef = useRef(true);
  const drawFrameCountRef = useRef(0);

  const isVisible = status === 'loading' || status === 'active';

  const syncContainerSize = () => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      sizeRef.current = { width: rect.width, height: rect.height };
      handTrackingDiagnostics.patch({
        canvasWidth: Math.round(rect.width),
        canvasHeight: Math.round(rect.height),
      });
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    syncContainerSize();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      syncContainerSize();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [isVisible, status]);

  useEffect(() => {
    if (status !== 'active') {
      handTrackingDiagnostics.patch({ drawingLandmarks: false, landmarksDrawn: 0 });
      return;
    }

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const { width, height } = sizeRef.current;
      if (!canvas || width === 0 || height === 0) return;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        PERFORMANCE_CONFIG.overlayCanvasMaxDpr,
      );

      const pixelWidth = Math.round(width * dpr);
      const pixelHeight = Math.round(height * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    const unsubscribe = animationLoop.subscribe(() => {
      try {
        syncContainerSize();

        const canvas = canvasRef.current;
        const { width, height } = sizeRef.current;
        if (!canvas || width === 0 || height === 0) {
          handTrackingDiagnostics.patch({ drawingLandmarks: false });
          return;
        }

        resizeCanvas();

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          handTrackingDiagnostics.patch({ drawingLandmarks: false });
          return;
        }

        const dpr = Math.min(
          window.devicePixelRatio || 1,
          PERFORMANCE_CONFIG.overlayCanvasMaxDpr,
        );

        const result = resultRef.current;
        if (!result?.hands.length) {
          if (!clearedRef.current) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clearedRef.current = true;
            lastDrawnTimestampRef.current = -1;
          }
          handTrackingDiagnostics.patch({ drawingLandmarks: false, landmarksDrawn: 0 });
          return;
        }

        if (result.timestamp === lastDrawnTimestampRef.current) {
          return;
        }

        lastDrawnTimestampRef.current = result.timestamp;
        clearedRef.current = false;
        drawFrameCountRef.current += 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawHandLandmarks(ctx, result, width, height, { mirrored });

        const landmarksDrawn = result.hands.reduce(
          (total, hand) => total + hand.landmarks.length,
          0,
        );

        handTrackingDiagnostics.patch({
          drawingLandmarks: true,
          landmarksDrawn,
          drawFrameCount: drawFrameCountRef.current,
        });
      } catch (error) {
        handTrackingDiagnostics.reportError('draw', error);
      }
    }, LOOP_PRIORITY.OVERLAY_DRAW);

    return unsubscribe;
  }, [mirrored, resultRef, status]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 contain-strict ${className} ${
        status === 'loading' ? 'flex items-center justify-center' : ''
      }`}
    >
      {status === 'loading' ? (
        <span className="rounded-full border border-aura-cyan/30 bg-aura-bg/60 px-2 py-1 text-[9px] tracking-wider text-aura-cyan uppercase">
          Loading model…
        </span>
      ) : (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />
      )}
    </div>
  );
}
