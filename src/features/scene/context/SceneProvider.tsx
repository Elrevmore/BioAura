import type { ReactNode } from 'react';
import type { SceneManager } from '../core/SceneManager';
import { SceneManagerContext } from './SceneContext';

interface SceneProviderProps {
  manager: SceneManager;
  children: ReactNode;
}

export function SceneProvider({ manager, children }: SceneProviderProps) {
  return (
    <SceneManagerContext.Provider value={manager}>
      {children}
    </SceneManagerContext.Provider>
  );
}
