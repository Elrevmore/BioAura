import { createContext } from 'react';
import type { SceneManager } from '../core/SceneManager';

export const SceneManagerContext = createContext<SceneManager | null>(null);
