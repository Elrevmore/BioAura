import type { ReactNode } from 'react';
import { ProteinContext } from './ProteinContext';
import { useProteinLoader } from '../hooks/useProteinLoader';

interface ProteinProviderProps {
  children: ReactNode;
  defaultPdbId?: string;
}

export function ProteinProvider({ children, defaultPdbId }: ProteinProviderProps) {
  const protein = useProteinLoader(defaultPdbId);

  return (
    <ProteinContext.Provider value={protein}>{children}</ProteinContext.Provider>
  );
}
