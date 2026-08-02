import { createContext } from 'react';
import type { PickIndex } from '../core/buildPickIndex';
import type { StructureModel } from '../types/structure-model.types';

export interface StructureModelContextValue {
  model: StructureModel;
  pickIndex: PickIndex;
}

export const StructureModelContext = createContext<StructureModelContextValue | null>(
  null,
);
