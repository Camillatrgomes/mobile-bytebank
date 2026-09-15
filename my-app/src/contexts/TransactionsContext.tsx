import React, { createContext, useContext, useMemo, useReducer, useState } from 'react';
import { useAccount } from '@/hooks/useAccount';

export type TransactionTypeFilter = 'all' | 'Credit' | 'Debit';

export interface TransactionFilters {
  /** YYYY-MM; vazio quando o filtro é "Todos os meses" ou há período. */
  month: string;
  type: TransactionTypeFilter;
  category: string;
  search: string;
  /** YYYY-MM-DD, inclusivo. */
  startDate: string | null;
  endDate: string | null;
}

type FiltersAction =
  | { type: 'setMonth'; month: string }
  | { type: 'setType'; transactionType: TransactionTypeFilter }
  | { type: 'setCategory'; category: string }
  | { type: 'setSearch'; search: string }
  | { type: 'setDateRange'; startDate: string | null; endDate: string | null }
  | { type: 'reset' };

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function createInitialFilters(): TransactionFilters {
  return { month: getCurrentMonth(), type: 'all', category: '', search: '', startDate: null, endDate: null };
}

export function filtersReducer(state: TransactionFilters, action: FiltersAction): TransactionFilters {
  switch (action.type) {
    case 'setMonth':
      return { ...state, month: action.month, startDate: null, endDate: null };
    case 'setType':
      return { ...state, type: action.transactionType };
    case 'setCategory':
      return { ...state, category: action.category };
    case 'setSearch':
      return { ...state, search: action.search };
    case 'setDateRange': {
      // Mês e período são exclusivos: com período o mês sai, sem período volta o mês atual.
      const hasRange = Boolean(action.startDate || action.endDate);
      return {
        ...state,
        startDate: action.startDate,
        endDate: action.endDate,
        month: hasRange ? '' : getCurrentMonth(),
      };
    }
    case 'reset':
      return createInitialFilters();
  }
}

type TransactionsContextValue = ReturnType<typeof useAccount> & {
  isFormOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
};

interface TransactionFiltersContextValue {
  filters: TransactionFilters;
  setMonth: (month: string) => void;
  setType: (type: TransactionTypeFilter) => void;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  resetFilters: () => void;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null);
const TransactionFiltersContext = createContext<TransactionFiltersContextValue | null>(null);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const account = useAccount();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const value = useMemo(
    () => ({
      ...account,
      isFormOpen,
      openForm: () => setIsFormOpen(true),
      closeForm: () => setIsFormOpen(false),
    }),
    [account, isFormOpen]
  );

  return (
    <TransactionsContext.Provider value={value}>
      <TransactionFiltersProvider>{children}</TransactionFiltersProvider>
    </TransactionsContext.Provider>
  );
}

// Provider próprio: digitar na busca não re-renderiza quem só lê as transações.
function TransactionFiltersProvider({ children }: { children: React.ReactNode }) {
  const [filters, dispatch] = useReducer(filtersReducer, undefined, createInitialFilters);

  const actions = useMemo(
    () => ({
      setMonth: (month: string) => dispatch({ type: 'setMonth', month }),
      setType: (transactionType: TransactionTypeFilter) => dispatch({ type: 'setType', transactionType }),
      setCategory: (category: string) => dispatch({ type: 'setCategory', category }),
      setSearch: (search: string) => dispatch({ type: 'setSearch', search }),
      setDateRange: (startDate: string | null, endDate: string | null) =>
        dispatch({ type: 'setDateRange', startDate, endDate }),
      resetFilters: () => dispatch({ type: 'reset' }),
    }),
    []
  );

  const value = useMemo(() => ({ filters, ...actions }), [filters, actions]);

  return <TransactionFiltersContext.Provider value={value}>{children}</TransactionFiltersContext.Provider>;
}

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions must be used within TransactionsProvider');
  return context;
}

export function useTransactionFilters(): TransactionFiltersContextValue {
  const context = useContext(TransactionFiltersContext);
  if (!context) throw new Error('useTransactionFilters must be used within TransactionsProvider');
  return context;
}
