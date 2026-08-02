import { motion } from 'framer-motion';
import { useCamera } from '../hooks/useCamera';

const ERROR_MESSAGES: Record<string, string> = {
  NotAllowedError: 'Camera permission denied. Allow access to use hand gestures.',
  NotFoundError: 'No camera found on this device.',
  NotReadableError: 'Camera is in use by another application.',
  OverconstrainedError: 'Camera does not support the requested resolution.',
  Unknown: 'Unable to access the webcam.',
};

interface CameraErrorStateProps {
  onRetry: () => void;
}

export function CameraErrorState({ onRetry }: CameraErrorStateProps) {
  const { state } = useCamera();
  const message =
    state.error
      ? (ERROR_MESSAGES[state.error.code] ?? state.error.message)
      : 'Camera unavailable';

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-aura-error/30 bg-aura-error/10">
        <svg
          className="h-5 w-5 text-aura-error"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <p className="text-xs leading-relaxed text-aura-text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-aura-border bg-aura-cyan/10 px-3 py-1.5 text-xs font-medium text-aura-cyan transition-colors hover:bg-aura-cyan/20"
      >
        Retry
      </button>
    </div>
  );
}

interface CameraLoadingStateProps {
  label?: string;
}

export function CameraLoadingState({ label = 'Connecting camera…' }: CameraLoadingStateProps) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-2 p-4"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-aura-cyan/30 border-t-aura-cyan"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      <p className="text-xs text-aura-text-muted" aria-hidden>
        {label}
      </p>
    </div>
  );
}
