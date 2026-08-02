import { useContext } from 'react';
import { SelectionContext } from '../context/SelectionContext';

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
}
