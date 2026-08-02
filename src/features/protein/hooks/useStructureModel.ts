import { useContext } from 'react';
import { StructureModelContext } from '../context/StructureModelContext';
import type { StructureModelContextValue } from '../context/StructureModelContext';

export function useStructureModel(): StructureModelContextValue | null {
  return useContext(StructureModelContext);
}
