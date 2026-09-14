import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { registerStatementRevalidator } from '@/lib/statementRevalidation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTransactionFilters, type TransactionFilters } from '@/contexts/TransactionsContext';
import type { IApiTransaction } from './useAccount';

export const STATEMENT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const DAY_MS = 86_400_000;

type StatementFilters = TransactionFilters;

interface StatementPage {
  transactions: IApiTransaction[];
  cursor: QueryDocumentSnapshot | null;
}

// Mesma normalização usada pelo backend ao gravar descriptionLower.
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Mês (YYYY-MM) e intervalo (YYYY-MM-DD, inclusivo) viram um único intervalo UTC, como o ISO do resto do app.
function dateBounds({ month, startDate, endDate }: StatementFilters) {
  const lower: number[] = [];
  const upper: number[] = [];
  if (month) {
    const [year, monthNumber] = month.split('-').map(Number);
    lower.push(Date.UTC(year, monthNumber - 1, 1));
    upper.push(Date.UTC(year, monthNumber, 1));
  }
  if (startDate) lower.push(Date.parse(startDate));
  if (endDate) upper.push(Date.parse(endDate) + DAY_MS);
  return {
    start: lower.length ? Math.max(...lower) : null,
    end: upper.length ? Math.min(...upper) : null,
  };
}

function statementQuery(uid: string, filters: StatementFilters) {
  const { start, end } = dateBounds(filters);
  if (start !== null && end !== null && start >= end) return null;

  const term = normalize(filters.search);
  const constraints: QueryConstraint[] = [];
  if (filters.type !== 'all') constraints.push(where('type', '==', filters.type));
  if (filters.category) constraints.push(where('category', '==', filters.category));
  if (start !== null) constraints.push(where('date', '>=', Timestamp.fromMillis(start)));
  if (end !== null) constraints.push(where('date', '<', Timestamp.fromMillis(end)));
  if (term) {
    // Busca por prefixo: o Firestore não oferece busca por "contém".
    constraints.push(where('descriptionLower', '>=', term), where('descriptionLower', '<=', `${term}\uf8ff`));
  }
  constraints.push(orderBy('date', 'desc'));
  if (term) constraints.push(orderBy('descriptionLower'));

  return query(collection(db, 'users', uid, 'transactions'), ...constraints);
}

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
