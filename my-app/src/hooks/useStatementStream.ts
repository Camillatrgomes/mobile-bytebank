import { useCallback, useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { container } from '@/infra/container';
import { statementStream } from '@/lib/statementStream';
import { trackLive, useAppStore } from '@/stores';
import { toStatementQuery } from '@/stores/filtersSlice';
import { useFilters } from '@/stores/selectors';
import { STATEMENT_PAGE_SIZE } from '@/stores/statementSlice';

/** Extrato ao vivo: os filtros alimentam um stream que troca o listener do Firestore. */
export function useStatementStream() {
  const uid = useAppStore((s) => s.user?.id ?? null);
  const filters = useFilters();
  const [query$] = useState(() => new BehaviorSubject(toStatementQuery(filters, STATEMENT_PAGE_SIZE)));

  // Filtro novo sempre volta à primeira página.
  useEffect(() => {
    query$.next(toStatementQuery(filters, STATEMENT_PAGE_SIZE));
  }, [filters, query$]);

  useEffect(() => {
    if (!uid) return;
    const { setStatement, failStatement, resetStatement } = useAppStore.getState();
    const subscription = trackLive(
      statementStream(query$, (query) => container.watchStatement(uid, query), {
        onNewQuery: resetStatement,
        onError: failStatement,
      }).subscribe(setStatement)
    );
    return () => subscription.unsubscribe();
  }, [uid, query$]);

  const loadMore = useCallback(() => {
    const before = useAppStore.getState().statementPageSize;
    useAppStore.getState().loadMore();
    const { statementPageSize, filters: current } = useAppStore.getState();
    if (statementPageSize !== before) query$.next(toStatementQuery(current, statementPageSize));
  }, [query$]);

  const transactions = useAppStore((s) => s.statementTransactions);
  const total = useAppStore((s) => s.statementTotal);
  const hasMore = useAppStore((s) => s.statementHasMore);
  const isLoading = useAppStore((s) => s.isStatementLoading);
  const isLoadingMore = useAppStore((s) => s.isLoadingMore);

  return { transactions, total, hasMore, isLoading, isLoadingMore, loadMore };
}
