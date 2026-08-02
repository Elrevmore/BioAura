import { useProtein } from '@features/protein';
import { LoadingOverlay } from './LoadingState';

/**
 * Viewport-level overlay shown while the protein structure is loading.
 */
export function ProteinLoadingOverlay() {
  const { status } = useProtein();

  if (status !== 'loading' && status !== 'idle') {
    return null;
  }

  return <LoadingOverlay label="Loading protein structure" />;
}
