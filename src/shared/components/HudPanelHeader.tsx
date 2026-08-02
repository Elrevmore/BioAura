import type { ReactNode } from 'react';

interface HudPanelHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  accent?: 'cyan' | 'violet';
}

export function HudPanelHeader({
  title,
  subtitle,
  trailing,
  accent = 'cyan',
}: HudPanelHeaderProps) {
  const accentClass = accent === 'cyan' ? 'text-aura-cyan' : 'text-aura-violet';

  return (
    <div className="flex items-center justify-between border-b border-aura-border px-3 py-2.5">
      <div>
        <p className={`text-[10px] font-medium tracking-widest uppercase ${accentClass}`}>
          {title}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-[10px] text-aura-text-muted">{subtitle}</p>
        )}
      </div>
      {trailing}
    </div>
  );
}
