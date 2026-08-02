import { ProteinStructureHost } from '@features/scene';
import { ProteinHighlight, ProteinPicker, ProteinViewer, MeasurementOverlay, useProtein } from '@features/protein';

/**
 * Composes the 3D protein content inside the scene's transform group.
 * Lives in UI layer to keep scene and protein features decoupled.
 */
export function ProteinSceneContent() {
  const { status, metadata } = useProtein();
  const structureKey =
    status === 'loaded' && metadata ? metadata.pdbId : null;

  return (
    <ProteinStructureHost structureKey={structureKey}>
      <ProteinViewer />
      <ProteinPicker />
      <ProteinHighlight />
      <MeasurementOverlay />
    </ProteinStructureHost>
  );
}
