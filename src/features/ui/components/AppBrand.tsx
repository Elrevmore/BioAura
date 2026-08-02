import { motion } from 'framer-motion';
import { APP_CONFIG } from '@shared/config';

export function AppBrand() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 items-center justify-center">
          <div className="absolute inset-0 animate-pulse-glow rounded-full border border-aura-cyan/40" />
          <div className="h-2 w-2 rounded-full bg-aura-cyan shadow-[0_0_12px_#22d3ee]" />
        </div>
        <div>
          <h1 className="text-glow text-lg font-semibold tracking-[0.2em] text-aura-cyan uppercase sm:text-xl">
            {APP_CONFIG.name}
          </h1>
          <p className="mt-0.5 hidden text-xs tracking-wide text-aura-text-muted sm:block">
            {APP_CONFIG.tagline}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
