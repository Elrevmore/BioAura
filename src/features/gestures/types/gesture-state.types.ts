import type { GestureEvent } from '@shared/types';

export interface GestureState {
  active: GestureEvent;
  history: GestureEvent[];
}
