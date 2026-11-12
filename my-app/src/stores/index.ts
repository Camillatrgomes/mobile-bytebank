import { create } from 'zustand';
import { revalidateStatement } from '@/lib/statementRevalidation';
import {
  cancelAccountRequests,
  createAccountSlice,
  initialAccountState,
  type AccountSlice,
} from './accountSlice';
import { createAuthSlice, type AuthSlice } from './authSlice';
import { createFiltersSlice, initialFilters, type FiltersSlice } from './filtersSlice';
import { createUiSlice, type UiSlice } from './uiSlice';

export type StoreState = AuthSlice & AccountSlice & FiltersSlice & UiSlice;

export const useAppStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createAccountSlice(...a),
  ...createFiltersSlice(...a),
  ...createUiSlice(...a),
}));

/** Zera o estado do usuário no logout. isAuthReady fica: a sessão já foi verificada. */
export function resetAll(): void {
  cancelAccountRequests();
  useAppStore.setState({
    user: null,
    ...initialAccountState,
    filters: initialFilters(),
    isFormOpen: false,
  });
}

/** Recarrega conta e extrato depois de uma escrita, furando a deduplicação. */
export function refreshAccount(): Promise<void> {
  revalidateStatement();
  return useAppStore.getState().loadAccount({ force: true });
}
