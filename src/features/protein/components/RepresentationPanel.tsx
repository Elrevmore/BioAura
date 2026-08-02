import { motion } from 'framer-motion';
import { GlassPanel, HudPanelHeader } from '@shared/components';
import { useProtein } from '../hooks/useProtein';
import { useRepresentation } from '../hooks/useRepresentation';
import { REPRESENTATION_LAYERS } from '../types/representation.types';

/**
 * Compact visibility controls for protein representation layers.
 */
export function RepresentationPanel() {
  const { status } = useProtein();
  const { representation, setLayerVisible } = useRepresentation();

  if (status !== 'loaded') {
    return null;
  }

  return (
    <div className="hidden w-full sm:block">
      <GlassPanel
        variant="strong"
        glow="cyan"
        className="w-full overflow-hidden lg:w-64"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <HudPanelHeader title="Representation" subtitle="Visibility layers" />

        <ul className="px-3 py-2">
          {REPRESENTATION_LAYERS.map((layer, index) => (
            <motion.li
              key={layer.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-aura-border/40 py-2 last:border-0"
            >
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={representation[layer.id]}
                  onChange={(event) => setLayerVisible(layer.id, event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-aura-border bg-aura-bg accent-aura-cyan"
                />
                <span className="text-xs text-aura-text">{layer.label}</span>
              </label>
            </motion.li>
          ))}
        </ul>
      </GlassPanel>
    </div>
  );
}
