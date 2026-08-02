import { PERFORMANCE_CONFIG } from '@shared/config';
import { Canvas } from '@react-three/fiber';
import { Suspense, type ReactNode } from 'react';
import { SceneProvider } from '../context/SceneProvider';
import type { SceneConfig } from '../core/SceneConfig';
import { DEFAULT_SCENE_CONFIG } from '../core/SceneConfig';
import { useSceneManagerInstance } from '../hooks/useSceneManagerInstance';
import { SceneContents } from './SceneContents';

interface SceneViewportProps {
  config?: SceneConfig;
  className?: string;
  proteinContent?: ReactNode;
}

function SceneCanvas({
  config,
  proteinContent,
}: {
  config: SceneConfig;
  proteinContent?: ReactNode;
}) {
  const manager = useSceneManagerInstance(config);
  const { renderer } = config;

  return (
    <SceneProvider manager={manager}>
      <Canvas
        dpr={[1, PERFORMANCE_CONFIG.maxDevicePixelRatio]}
        gl={{
          antialias: renderer.antialias,
          alpha: renderer.alpha,
          powerPreference: 'high-performance',
        }}
        className="h-full w-full"
      >
        <Suspense fallback={null}>
          <SceneContents proteinContent={proteinContent} />
        </Suspense>
      </Canvas>
    </SceneProvider>
  );
}

/**
 * Full-screen Three.js viewport integrated with React Three Fiber.
 * Entry point for the 3D scene in the application layout.
 */
export function SceneViewport({
  config = DEFAULT_SCENE_CONFIG,
  className = '',
  proteinContent,
}: SceneViewportProps) {
  return (
    <div className={`h-full w-full ${className}`} aria-label="3D protein viewport">
      <SceneCanvas config={config} proteinContent={proteinContent} />
    </div>
  );
}
