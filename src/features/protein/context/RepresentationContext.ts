import { createContext } from 'react';
import type {
  ProteinRepresentationState,
  RepresentationLayerId,
} from '../types/representation.types';

export interface RepresentationContextValue {
  representation: ProteinRepresentationState;
  setLayerVisible: (layerId: RepresentationLayerId, visible: boolean) => void;
  setRepresentation: (update: Partial<ProteinRepresentationState>) => void;
}

export const RepresentationContext = createContext<RepresentationContextValue | null>(null);
