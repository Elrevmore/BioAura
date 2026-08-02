import { useSceneManager } from '../hooks/useSceneManager';

/**
 * Lighting rig matching SceneLighting class positions and colors.
 * Declarative R3F equivalent of the imperative SceneLighting factory.
 */
export function SceneLights() {
  const manager = useSceneManager();
  const { lighting } = manager.config;

  return (
    <>
      <ambientLight intensity={lighting.ambientIntensity} />
      <directionalLight
        color={0xcffafe}
        intensity={lighting.keyIntensity}
        position={[5, 8, 6]}
      />
      <pointLight
        color={0x22d3ee}
        intensity={lighting.fillIntensity}
        distance={40}
        position={[-6, 2, 4]}
      />
      <pointLight
        color={0x8b5cf6}
        intensity={lighting.rimIntensity}
        distance={40}
        position={[0, -4, -8]}
      />
    </>
  );
}
