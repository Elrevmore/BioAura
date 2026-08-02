import { useEffect, useState } from 'react';
import { SceneManager } from '../core/SceneManager';
import type { SceneConfig } from '../core/SceneConfig';
import { DEFAULT_SCENE_CONFIG } from '../core/SceneConfig';

/**
 * Creates a singleton SceneManager per component tree mount.
 * Disposes GPU resources on unmount.
 */
export function useSceneManagerInstance(
  config: SceneConfig = DEFAULT_SCENE_CONFIG,
): SceneManager {
  const [manager] = useState(() => new SceneManager(config));

  useEffect(() => {
    return () => manager.dispose();
  }, [manager]);

  return manager;
}
