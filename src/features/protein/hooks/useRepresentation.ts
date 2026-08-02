import { useContext } from 'react';
import { RepresentationContext } from '../context/RepresentationContext';
import type { RepresentationContextValue } from '../context/RepresentationContext';

export function useRepresentation(): RepresentationContextValue {
  const context = useContext(RepresentationContext);
  if (!context) {
    throw new Error('useRepresentation must be used within a RepresentationProvider');
  }
  return context;
}
