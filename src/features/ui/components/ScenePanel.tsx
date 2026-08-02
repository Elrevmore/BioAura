import { SceneViewport } from '@features/scene';
import { ProteinSceneContent } from './ProteinSceneContent';

/**
 * Composes the 3D scene viewport with protein content.
 */
export function ScenePanel() {
  return <SceneViewport proteinContent={<ProteinSceneContent />} />;
}
