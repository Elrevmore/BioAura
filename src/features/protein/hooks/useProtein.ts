import { useContext } from 'react';
import { ProteinContext } from '../context/ProteinContext';
import type { ProteinContextValue } from '../types/protein-feature.types';

export function useProtein(): ProteinContextValue {
  const context = useContext(ProteinContext);
  if (!context) {
    throw new Error('useProtein must be used within a ProteinProvider');
  }
  return context;
}
