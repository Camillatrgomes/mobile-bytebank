import type { StateCreator } from 'zustand';
import type { Transaction } from '@/domain/entities/Transaction';
import type { StatementSnapshot } from '@/domain/repositories/TransactionRepository';
import type { StoreState } from './index';

export const STATEMENT_PAGE_SIZE = 10;

export interface StatementSlice {
  /** Página filtrada do extrato; a base do saldo é `transactions`. */
  statementTransactions: readonly Transaction[];
  /** Total do filtro, contado no servidor. */
  statementTotal: number;
  statementHasMore: boolean;
  statementPageSize: number;
  isStatementLoading: boolean;
  isLoadingMore: boolean;
  statementError: Error | null;
  setStatement: (snapshot: StatementSnapshot) => void;
  failStatement: (error: Error) => void;
  /** Pede a próxima página mantendo a lista; quem observa o tamanho refaz a assinatura. */
  loadMore: () => void;
  resetStatement: () => void;
}

export const initialStatementState = {
  statementTransactions: [],
  statementTotal: 0,
  statementHasMore: false,
  statementPageSize: STATEMENT_PAGE_SIZE,
  isStatementLoading: true,
  isLoadingMore: false,
  statementError: null,
} satisfies Partial<StatementSlice>;

export const createStatementSlice: StateCreator<StoreState, [['zustand/persist', unknown]], [], StatementSlice> = (set, get) => ({
  ...initialStatementState,
  setStatement: ({ transactions, total, hasMore }) =>
    set({
      statementTransactions: transactions,
      statementTotal: total,
      statementHasMore: hasMore,
      isStatementLoading: false,
      isLoadingMore: false,
      statementError: null,
    }),
  failStatement: (error) => set({ statementError: error, isStatementLoading: false, isLoadingMore: false }),
  loadMore: () => {
    const { statementHasMore, isLoadingMore, isStatementLoading, statementPageSize } = get();
    if (!statementHasMore || isLoadingMore || isStatementLoading) return;
    set({ isLoadingMore: true, statementPageSize: statementPageSize + STATEMENT_PAGE_SIZE });
  },
  resetStatement: () => set(initialStatementState),
});
