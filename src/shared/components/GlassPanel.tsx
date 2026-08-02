import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type GlassVariant = 'default' | 'strong';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: GlassVariant;
  glow?: 'cyan' | 'violet' | 'none';
  className?: string;
}

const VARIANT_CLASS: Record<GlassVariant, string> = {
  default: 'glass-panel',
  strong: 'glass-panel-strong',
};

const GLOW_CLASS = {
  cyan: 'shadow-[0_0_30px_rgba(34,211,238,0.08)]',
  violet: 'shadow-[0_0_30px_rgba(139,92,246,0.08)]',
  none: '',
};

/**
 * Reusable glassmorphism container with optional entrance animation.
 */
export function GlassPanel({
  children,
  variant = 'default',
  glow = 'none',
  className = '',
  ...motionProps
}: GlassPanelProps) {
  return (
    <motion.div
      className={`${VARIANT_CLASS[variant]} ${GLOW_CLASS[glow]} ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
