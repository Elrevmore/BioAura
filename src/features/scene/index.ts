export { ManipulationProvider } from './components/ManipulationProvider';
export { SceneViewport } from './components/SceneViewport';
export { SceneContents } from './components/SceneContents';
export { SceneLights } from './components/SceneLights';
export { ProteinTransformGroup } from './components/ProteinTransformGroup';
export { ProteinStructureHost } from './components/ProteinStructureHost';
export { HolographicGrid, HolographicReference } from './components/HolographicReference';
export { DevOrbitControls, SceneRendererSetup } from './components/SceneHelpers';

export { SceneManager } from './core/SceneManager';
export { SceneStack } from './core/SceneStack';
export { SceneCamera } from './core/SceneCamera';
export { SceneLighting } from './core/SceneLighting';
export { SceneRenderer } from './core/SceneRenderer';
export {
  DEFAULT_SCENE_CONFIG,
  DEFAULT_PROTEIN_TRANSFORM,
  type SceneConfig,
} from './core/SceneConfig';

export { SceneProvider } from './context/SceneProvider';
export { useSceneManager } from './hooks/useSceneManager';
export { GestureProteinController } from './core/GestureProteinController';
export type { ManipulationState } from './core/GestureProteinController';
export { useManipulationRef, useManipulationSnapshot } from './hooks/useManipulationRef';
