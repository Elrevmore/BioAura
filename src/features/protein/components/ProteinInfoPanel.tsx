import { AnimatePresence, motion } from 'framer-motion';
import { useProtein } from '../hooks/useProtein';
import { GlassPanel, LoadingSpinner } from '@shared/components';

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start justify-between gap-4 border-b border-aura-border/50 py-2.5 last:border-0"
    >
      <span className="text-[10px] tracking-wider text-aura-text-muted uppercase">
        {label}
      </span>
      <span className="max-w-[58%] text-right text-xs leading-snug text-aura-text">
        {value}
      </span>
    </motion.div>
  );
}

const PANEL_BASE_CLASS =
  'z-10 w-full';

const PANEL_FLOATING_CLASS = `${PANEL_BASE_CLASS} pointer-events-none absolute bottom-44 left-4 right-4 sm:hidden`;

const PANEL_RAIL_CLASS = `${PANEL_BASE_CLASS} pointer-events-auto hidden sm:block`;

interface ProteinInfoPanelProps {
  /** floating = mobile overlay; rail = desktop left column stack */
  variant?: 'floating' | 'rail';
}

/**
 * Floating panel displaying protein metadata with loading and error states.
 */
export function ProteinInfoPanel({ variant = 'floating' }: ProteinInfoPanelProps) {
  const { status, metadata, error, reload } = useProtein();
  const positionClass = variant === 'rail' ? PANEL_RAIL_CLASS : PANEL_FLOATING_CLASS;
  const loadedGlassClass =
    variant === 'rail'
      ? 'flex max-h-[min(18rem,40vh)] flex-col overflow-hidden'
      : 'flex max-h-[min(16rem,32vh)] flex-col overflow-hidden';

  return (
    <AnimatePresence mode="wait">
      {(status === 'loading' || status === 'idle') && (
        <motion.aside
          key="loading"
          className={`${positionClass} pointer-events-none`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          role="status"
          aria-live="polite"
          aria-label="Loading protein structure"
        >
          <GlassPanel variant="strong" glow="cyan" className="p-5">
            <LoadingSpinner size="sm" label="Fetching structure" />
          </GlassPanel>
        </motion.aside>
      )}

      {status === 'error' && (
        <motion.aside
          key="error"
          className={`${positionClass} pointer-events-auto`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <GlassPanel variant="strong" className="p-4">
            <p className="text-xs font-medium text-aura-error">Structure unavailable</p>
            <p className="mt-1 text-[10px] leading-relaxed text-aura-text-muted">{error}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className="mt-3 w-full rounded-lg border border-aura-border bg-aura-cyan/10 py-2 text-xs font-medium text-aura-cyan transition-colors hover:bg-aura-cyan/20"
            >
              Retry load
            </button>
          </GlassPanel>
        </motion.aside>
      )}

      {status === 'loaded' && metadata && (
        <motion.aside
          key="loaded"
          className={`${positionClass} pointer-events-auto`}
          initial={{ opacity: 0, x: -20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          aria-label="Protein information"
        >
          <GlassPanel variant="strong" glow="cyan" className={loadedGlassClass}>
            <div className="shrink-0 border-b border-aura-border bg-aura-cyan/5 px-4 py-3">
              <p className="text-[10px] tracking-widest text-aura-cyan uppercase">
                Structure
              </p>
              <h2 className="text-glow mt-1 text-base font-semibold text-aura-text">
                {metadata.name}
              </h2>
              <p className="mt-0.5 font-mono text-[10px] text-aura-text-muted">
                PDB {metadata.pdbId}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-1">
              <InfoRow label="Organism" value={metadata.organism} />
              <InfoRow label="Function" value={metadata.function} />
              <InfoRow label="Chains" value={metadata.chainCount} />
              <InfoRow label="Amino Acids" value={metadata.aminoAcidCount} />
            </div>
          </GlassPanel>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
