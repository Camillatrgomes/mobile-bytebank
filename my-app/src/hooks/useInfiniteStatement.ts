import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import {
  getCountFromServer,
  getDocs,
  limit,
  query,
  startAfter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { buildStatementQuery } from '@/infra/repositories/FirestoreTransactionRepository';
import { registerStatementRevalidator } from '@/lib/statementRevalidation';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  toStatementQuery,
  useTransactionFilters,
  type TransactionFilters,
} from '@/contexts/TransactionsContext';
import type { IApiTransaction } from './useAccount';

export const STATEMENT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type StatementFilters = TransactionFilters;

interface StatementPage {
  transactions: IApiTransaction[];
  cursor: QueryDocumentSnapshot | null;
}

// O tamanho de página não entra na query base; a paginação aplica o limit depois.
const statementQuery = (uid: string, filters: StatementFilters) =>
  buildStatementQuery(uid, toStatementQuery(filters, STATEMENT_PAGE_SIZE));

const toTransaction = (snapshot: QueryDocumentSnapshot): IApiTransaction => {
  const data = snapshot.data();
  return { ...data, id: snapshot.id, date: data.date.toDate().toISOString() } as IApiTransaction;
};

type PageKey = readonly ['statement', string, StatementFilters, number, QueryDocumentSnapshot | null];

async function fetchPage([, uid, filters, pageSize, cursor]: PageKey): Promise<StatementPage> {
  const base = statementQuery(uid, filters);
  if (!base) return { transactions: [], cursor: null };

  // Um item a mais revela se existe próxima página sem consulta extra.
  const snapshot = await getDocs(
    cursor ? query(base, startAfter(cursor), limit(pageSize + 1)) : query(base, limit(pageSize + 1))
  );
  const docs = snapshot.docs.slice(0, pageSize);
  return {
    transactions: docs.map(toTransaction),
    cursor: snapshot.size > pageSize ? docs[docs.length - 1] : null,
  };
}

async function fetchCount([, uid, filters]: readonly ['statement-count', string, StatementFilters]) {
  const base = statementQuery(uid, filters);
  if (!base) return 0;
  const snapshot = await getCountFromServer(base);
  return snapshot.data().count;
}

/** Extrato paginado por cursor direto do Firestore, com os filtros traduzidos para a query. */
export function useInfiniteStatement(pageSize: number = STATEMENT_PAGE_SIZE) {
  const uid = useAuthContext().user?.id ?? null;
  const {
    filters: { month, type, category, search, startDate, endDate },
  } = useTransactionFilters();

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const filters: StatementFilters = {
    month,
    type,
    category,
    search: debouncedSearch,
    startDate,
    endDate,
  };

  const {
    data,
    error,
    isLoading,
    size,
    setSize,
    mutate: mutatePages,
  } = useSWRInfinite<StatementPage, Error, (index: number, previous: StatementPage | null) => PageKey | null>(
    (_index, previous) =>
      !uid || (previous && !previous.cursor)
        ? null
        : (['statement', uid, filters, pageSize, previous?.cursor ?? null] as const),
    fetchPage,
    { revalidateOnFocus: false }
  );

  const { data: total = 0, mutate: mutateTotal } = useSWR(
    uid ? (['statement-count', uid, filters] as const) : null,
    fetchCount,
    { revalidateOnFocus: false }
  );

  const mutate = useCallback(() => Promise.all([mutatePages(), mutateTotal()]), [mutatePages, mutateTotal]);

  useEffect(() => registerStatementRevalidator(mutate), [mutate]);

  const transactions = useMemo(() => data?.flatMap((page) => page.transactions) ?? [], [data]);
  const hasMore = Boolean(data?.[data.length - 1]?.cursor);
  const isLoadingMore = Boolean(data && data.length < size);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) setSize(size + 1);
  }, [hasMore, isLoadingMore, setSize, size]);

  return {
    transactions,
    /** Total do filtro, contado no servidor. */
    total,
    hasMore,
    loadMore,
    isLoadingMore,
    isLoading,
    error,
    mutate,
  };
}
