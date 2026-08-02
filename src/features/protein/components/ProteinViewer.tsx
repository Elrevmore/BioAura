import { useProtein } from '../hooks/useProtein';
import { ProteinMesh } from './ProteinMesh';

/**
 * Scene-level protein viewer — mesh only; loading/error handled by UI overlay.
 */
export function ProteinViewer() {
  const { status, rawData, structureFormat } = useProtein();

  if (status !== 'loaded' || !rawData) {
    return null;
  }

  return <ProteinMesh pdbText={rawData} format={structureFormat ?? 'pdb'} />;
}
