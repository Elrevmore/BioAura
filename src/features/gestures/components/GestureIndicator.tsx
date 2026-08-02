import { AnimatePresence } from 'framer-motion';
import type { GestureType } from '@shared/types';
import { GlassPanel } from '@shared/components';
import { useGestures } from '../hooks/useGestures';

const GESTURE_LABELS: Record<GestureType, string> = {
  pinch: 'Pinch',
  grab: 'Grab',
  grab_rotate: 'Grab & Twist',
  open_palm: 'Open Palm',
  two_hand_zoom: 'Two-Hand Zoom',
  release: 'Release',
  none: 'Idle',
};

const GESTURE_GLOW: Record<GestureType, 'cyan' | 'violet' | 'none'> = {
  pinch: 'cyan',
  grab: 'violet',
  grab_rotate: 'cyan',
  open_palm: 'cyan',
  two_hand_zoom: 'violet',
  release: 'none',
  none: 'none',
};

interface GestureIndicatorProps {
  className?: string;
}

export function GestureIndicator({ className = '' }: GestureIndicatorProps) {
  const { activeGesture } = useGestures();
  const { type, confidence } = activeGesture;
  const isActive = type !== 'none';

  return (
    <div
      className={`pointer-events-none ${className}`}
      role="status"
      aria-live="polite"
      aria-label={isActive ? `Active gesture: ${GESTURE_LABELS[type]}` : 'No active gesture'}
    >
      <AnimatePresence mode="wait">
        <GlassPanel
          key={type}
          variant="strong"
          glow={GESTURE_GLOW[type]}
          className="flex items-center gap-3 px-4 py-2.5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <GestureIcon type={type} active={isActive} />
          <div>
            <p className="text-[10px] tracking-widest text-aura-text-muted uppercase">
              Gesture
            </p>
            <p className={`text-sm font-medium ${isActive ? 'text-aura-cyan' : 'text-aura-text-muted'}`}>
              {GESTURE_LABELS[type]}
            </p>
          </div>
          {isActive && (
            <span className="ml-1 font-mono text-[10px] text-aura-text-muted">
              {Math.round(confidence * 100)}%
            </span>
          )}
        </GlassPanel>
      </AnimatePresence>
    </div>
  );
}

function GestureIcon({ type, active }: { type: GestureType; active: boolean }) {
  const color = active ? '#22d3ee' : '#94a3b8';

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" aria-hidden>
      {type === 'pinch' && (
        <>
          <circle cx="9" cy="12" r="2" />
          <circle cx="15" cy="12" r="2" />
          <path d="M11 12h2" />
        </>
      )}
      {type === 'grab' && <path d="M8 10v4a4 4 0 008 0v-4l-2 2-2-3-2 3-2-2z" />}
      {type === 'open_palm' && (
        <>
          <path d="M12 4v16" />
          <path d="M8 8v8M16 8v8" />
        </>
      )}
      {type === 'two_hand_zoom' && (
        <>
          <path d="M4 12h4M16 12h4" />
          <path d="M8 8l-2 4 2 4M16 8l2 4-2 4" />
        </>
      )}
      {type === 'grab_rotate' && <path d="M12 4a8 8 0 108 8" strokeLinecap="round" />}
      {type === 'release' && <path d="M8 12h8M12 8v8" strokeLinecap="round" />}
      {type === 'none' && <circle cx="12" cy="12" r="6" strokeDasharray="3 3" />}
    </svg>
  );
}
