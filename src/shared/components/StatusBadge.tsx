type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'cyan' | 'violet';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
  pulse?: boolean;
  className?: string;
}

const TONE_STYLES: Record<StatusTone, string> = {
  success: 'border-aura-success/30 bg-aura-success/10 text-aura-success',
  warning: 'border-aura-warning/30 bg-aura-warning/10 text-aura-warning',
  error: 'border-aura-error/30 bg-aura-error/10 text-aura-error',
  info: 'border-aura-cyan/30 bg-aura-cyan/10 text-aura-cyan',
  neutral: 'border-aura-border bg-aura-bg/60 text-aura-text-muted',
  cyan: 'border-aura-cyan/30 bg-aura-cyan/10 text-aura-cyan',
  violet: 'border-aura-violet/30 bg-aura-violet/10 text-aura-violet',
};

export function StatusBadge({
  label,
  tone = 'neutral',
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[9px] tracking-wide uppercase ${TONE_STYLES[tone]} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? 'animate-pulse-glow' : ''}`}
        aria-hidden
      />
      {label}
    </span>
  );
}
