import { useHandTracking } from '@features/hand-tracking';
import { PERFORMANCE_CONFIG } from '@shared/config';
import { useEffect, useRef, useState } from 'react';

interface PerfSnapshot {
  trackingFps: number;
  handCount: number;
  loopSubscribers: number;
  heapMb: number | null;
}

/**
 * Dev-only performance overlay — tracks vision pipeline FPS and memory.
 */
export function PerformanceMonitor() {
  const { stats, status } = useHandTracking();
  const [snapshot, setSnapshot] = useState<PerfSnapshot>({
    trackingFps: 0,
    handCount: 0,
    loopSubscribers: 0,
    heapMb: null,
  });
  const intervalRef = useRef(0);

  useEffect(() => {
    if (!PERFORMANCE_CONFIG.enablePerfOverlay) return;

    intervalRef.current = window.setInterval(async () => {
      const { animationLoop } = await import('@shared/lib');
      const memory = performance as Performance & {
        memory?: { usedJSHeapSize: number };
      };

      setSnapshot({
        trackingFps: stats.fps,
        handCount: stats.handCount,
        loopSubscribers: animationLoop.getSubscriberCount(),
        heapMb: memory.memory
          ? Math.round(memory.memory.usedJSHeapSize / 1024 / 1024)
          : null,
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [stats.fps, stats.handCount]);

  if (!PERFORMANCE_CONFIG.enablePerfOverlay || status !== 'active') {
    return null;
  }

  return (
    <div className="pointer-events-none absolute top-28 right-4 z-30 font-mono text-[9px] sm:right-6">
      <div className="glass-panel border-aura-violet/20 px-2.5 py-2 text-aura-text-muted">
        <p className="mb-1 text-[8px] tracking-widest text-aura-violet uppercase">
          Perf
        </p>
        <p>
          Track <span className="text-aura-cyan">{snapshot.trackingFps}</span> fps
        </p>
        <p>
          Hands <span className="text-aura-violet">{snapshot.handCount}</span>
        </p>
        <p>
          Loop <span className="text-aura-text">{snapshot.loopSubscribers}</span> subs
        </p>
        {snapshot.heapMb !== null && (
          <p>
            Heap <span className="text-aura-text">{snapshot.heapMb}</span> MB
          </p>
        )}
      </div>
    </div>
  );
}
