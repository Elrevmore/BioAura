import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GestureType } from '@shared/types';
import { GlassPanel } from '@shared/components';

interface GestureGuideItem {
  gesture: GestureType;
  label: string;
  description: string;
}

const GESTURE_GUIDE: GestureGuideItem[] = [
  { gesture: 'pinch', label: 'Pinch', description: 'Drag to move the structure' },
  { gesture: 'grab', label: 'Grab', description: 'Closed fist to translate' },
  { gesture: 'grab_rotate', label: 'Grab & Twist', description: 'Closed fist, twist wrist to spin' },
  { gesture: 'two_hand_zoom', label: 'Zoom', description: 'Two hands — spread to scale' },
  { gesture: 'open_palm', label: 'Release', description: 'Open palm to stop manipulating' },
];

function getInitialOpenState(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(min-width: 640px)').matches;
}

/**
 * Collapsible gesture reference panel for onboarding.
 */
const GUIDE_PANEL_ID = 'gesture-guide-panel';

export function GestureGuide() {
  const [isOpen, setIsOpen] = useState(getInitialOpenState);

  return (
    <div className="hidden w-full sm:block">
      <GlassPanel
        variant="strong"
        glow="cyan"
        className="w-full overflow-hidden lg:w-64"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between border-b border-aura-border px-3 py-2.5 text-left transition-colors hover:bg-aura-cyan/5"
          aria-expanded={isOpen}
          aria-controls={GUIDE_PANEL_ID}
        >
          <span className="text-[10px] font-medium tracking-widest text-aura-cyan uppercase">
            Gesture Guide
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-aura-text-muted"
            aria-hidden
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.ul
              id={GUIDE_PANEL_ID}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-h-[min(16rem,35vh)] overflow-y-auto overflow-x-hidden"
            >
              {GESTURE_GUIDE.map((item, index) => (
                <motion.li
                  key={item.gesture}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-aura-border/40 px-3 py-2.5 last:border-0"
                >
                  <p className="text-xs font-medium text-aura-text">{item.label}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-aura-text-muted">
                    {item.description}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </GlassPanel>
    </div>
  );
}
