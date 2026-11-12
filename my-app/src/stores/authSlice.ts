import type { StateCreator } from 'zustand';
import type { AuthUser } from '@/domain/entities/User';
import type { StoreState } from './index';

export interface AuthSlice {
  user: AuthUser | null;
  /** O Firebase já informou se existe sessão salva. */
  isAuthReady: boolean;
  setUser: (user: AuthUser | null) => void;
  markAuthReady: () => void;
}

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (set) => ({
  user: null,
  isAuthReady: false,
  setUser: (user) => set({ user }),
  markAuthReady: () => set({ isAuthReady: true }),
});
