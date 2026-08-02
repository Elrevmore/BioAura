import { createContext } from 'react';
import type { ProteinContextValue } from '../types/protein-feature.types';

export const ProteinContext = createContext<ProteinContextValue | null>(null);
