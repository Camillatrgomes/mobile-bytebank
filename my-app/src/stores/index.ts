import type { Subscription } from 'rxjs';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { container } from '@/infra/container';
import { revalidateStatement } from '@/lib/statementRevalidation';
import {
  cancelAccountRequests,
  createAccountSlice,
  initialAccountState,
  type AccountSlice,
} from './accountSlice';
import { isCacheUsable } from './cachePolicy';
import { createAuthSlice, type AuthSlice } from './authSlice';
import { createFiltersSlice, initialFilters, type FiltersSlice } from './filtersSlice';
import { createUiSlice, type UiSlice } from './uiSlice';

export type StoreState = AuthSlice & AccountSlice & FiltersSlice & UiSlice;

export const useAppStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createAccountSlice(...a),
      ...createFiltersSlice(...a),
      ...createUiSlice(...a),
    }),
    {
      name: 'bytebank-cache',
      version: 1,
      storage: createJSONStorage(() => container.encryptedStorage),
      // Só dados do servidor: filtros, UI e auth não sobrevivem ao app.
      partialize: (s) => ({
        account: s.account,
        transactions: s.transactions,
        cacheOwner: s.cacheOwner,
        cachedAt: s.cachedAt,
      }),
      merge: (persisted, current) => {
        const cache = persisted as Partial<StoreState> | undefined;
        // cachedAt já preenchido: o stream emitiu antes da hidratação e é mais novo.
        if (!cache || current.cachedAt !== null || !isCacheUsable(cache, current.user?.id ?? null)) {
          return current;
        }
        // Com cache válido não há skeleton: o stream de transações atualiza em segundo plano.
        return { ...current, ...cache, isAccountLoading: false };
      },
    },
  ),
);

const live = new Set<Subscription>();

/** Registra uma assinatura ao vivo para o logout encerrá-la antes de mexer na store. */
export function trackLive(subscription: Subscription): Subscription {
  live.add(subscription);
  subscription.add(() => live.delete(subscription));
  return subscription;
}

/** Zera o estado do usuário no logout. isAuthReady fica: a sessão já foi verificada. */
export function resetAll(): void {
  // Antes de qualquer set: uma emissão depois do forgetCache recriaria a chave do cache.
  live.forEach((subscription) => subscription.unsubscribe());
  cancelAccountRequests();
  useAppStore.setState({
    user: null,
    ...initialAccountState,
    filters: initialFilters(),
    isFormOpen: false,
  });
}

/** Recarrega o extrato depois de uma escrita. */
export function refreshAccount(): void {
  revalidateStatement();
}
