import type { StateCreator } from 'zustand';
import type { AuthUser } from '@/domain/entities/User';
import { cancelAccountRequests, initialAccountState } from './accountSlice';
import type { StoreState } from './index';

export interface AuthSlice {
  user: AuthUser | null;
  /** O Firebase já informou se existe sessão salva. */
  isAuthReady: boolean;
  setUser: (user: AuthUser | null) => void;
  markAuthReady: () => void;
}

export const createAuthSlice: StateCreator<StoreState, [['zustand/persist', unknown]], [], AuthSlice> = (set, get) => ({
  user: null,
  isAuthReady: false,
  setUser: (user) => {
    // Outro usuário na mesma sessão (ex.: expirou sem logout): não herda a conta do anterior.
    const isOtherOwner = (owner: string | null) => !!user && owner !== null && owner !== user.id;
    if (isOtherOwner(get().cacheOwner)) cancelAccountRequests();
    set((s) => (isOtherOwner(s.cacheOwner) ? { user, ...initialAccountState } : { user }));
  },
  markAuthReady: () => set({ isAuthReady: true }),
});
