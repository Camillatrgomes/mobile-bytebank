import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getAccountSummary } from '@/domain/usecases/getAccountSummary';
import { useAppStore } from './index';

export const useAuthUser = () => useAppStore((s) => s.user);

export const useAuthStatus = () =>
  useAppStore(useShallow((s) => ({ isAuthenticated: s.user !== null, isReady: s.isAuthReady })));

export const useFilters = () => useAppStore((s) => s.filters);

export const useFilterActions = () =>
  useAppStore(
    useShallow((s) => ({
      setMonth: s.setMonth,
      setType: s.setType,
      setCategory: s.setCategory,
      setSearch: s.setSearch,
      setDateRange: s.setDateRange,
      resetFilters: s.resetFilters,
    }))
  );

export const useAccountData = () =>
  useAppStore(
    useShallow((s) => ({
      account: s.account,
      transactions: s.transactions,
      isLoading: s.isAccountLoading,
      error: s.accountError,
    }))
  );

export function useAccountSummary() {
  const transactions = useAppStore((s) => s.transactions);
  return useMemo(() => getAccountSummary(transactions), [transactions]);
}

export const useTransactionForm = () =>
  useAppStore(
    useShallow((s) => ({ isFormOpen: s.isFormOpen, openForm: s.openForm, closeForm: s.closeForm }))
  );
