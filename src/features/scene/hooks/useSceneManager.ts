import { useContext } from 'react';
import { SceneManagerContext } from '../context/SceneContext';
import type { SceneManager } from '../core/SceneManager';

export function useSceneManager(): SceneManager {
  const manager = useContext(SceneManagerContext);
  if (!manager) {
    throw new Error('useSceneManager must be used within a SceneProvider');
  }
  return manager;
}
