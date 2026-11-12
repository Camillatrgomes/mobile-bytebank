import type { StateCreator } from 'zustand';
import type { StoreState } from './index';

export interface UiSlice {
  isFormOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
}

export const createUiSlice: StateCreator<StoreState, [['zustand/persist', unknown]], [], UiSlice> = (set) => ({
  isFormOpen: false,
  openForm: () => set({ isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false }),
});
