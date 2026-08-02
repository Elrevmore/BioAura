import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { CameraProvider } from '@features/camera';
import { GestureProvider } from '@features/gestures';
import { HandTrackingProvider } from '@features/hand-tracking';
import { ProteinProvider, RepresentationProvider, SelectionProvider, StructureModelProvider } from '@features/protein';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Provider chain: camera → hand tracking → gestures → protein data.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MotionConfig reducedMotion="user">
      <CameraProvider>
        <HandTrackingProvider>
          <GestureProvider>
            <ProteinProvider>
              <RepresentationProvider>
                <SelectionProvider>
                  <StructureModelProvider>{children}</StructureModelProvider>
                </SelectionProvider>
              </RepresentationProvider>
            </ProteinProvider>
          </GestureProvider>
        </HandTrackingProvider>
      </CameraProvider>
    </MotionConfig>
  );
}
