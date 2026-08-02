import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md';
  label?: string;
}

export function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-10 w-10';

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="status"
      aria-live="polite"
      aria-label={label ?? 'Loading'}
    >
      <motion.div
        className={`${sizeClass} rounded-full border-2 border-aura-cyan/20 border-t-aura-cyan`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      {label && (
        <p className="text-[10px] tracking-widest text-aura-cyan uppercase" aria-hidden>
          {label}
        </p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  label?: string;
  className?: string;
}

/** Centered loading overlay for viewport or panels */
export function LoadingOverlay({
  label = 'Initializing',
  className = '',
}: LoadingOverlayProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="glass-panel-strong px-8 py-6">
        <LoadingSpinner label={label} />
      </div>
    </div>
  );
}
