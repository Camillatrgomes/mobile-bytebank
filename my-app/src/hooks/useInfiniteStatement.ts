import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useStatement } from './useStatement';
import type { RootState } from '@/store';

export const STATEMENT_PAGE_SIZE = 10;

/**
 * Paginação do extrato para scroll infinito.
 *
 * Hoje a fonte é o array já filtrado que `useStatement()` devolve, e a
 * paginação é um fatiamento no cliente. Quando o Firestore virar a fonte de
 * verdade, só o miolo deste hook muda — para `limit` + `startAfter` com
 * cursor — mantendo a mesma interface de retorno, de modo que nenhuma tela
 * precise ser alterada. Por isso `isLoadingMore` já existe aqui, mesmo sendo
 * sempre falso enquanto o fatiamento for síncrono.
 */
export function useInfiniteStatement(pageSize: number = STATEMENT_PAGE_SIZE) {
  const { transactions, isLoading, error, mutate } = useStatement();
  const { month, type, category, search, startDate, endDate } = useSelector(
    (s: RootState) => s.filter
  );

  const [page, setPage] = useState(1);

  // Qualquer mudança de filtro recomeça a paginação da primeira página —
  // senão o usuário filtra e continua vendo a contagem de páginas anterior.
  useEffect(() => {
    setPage(1);
  }, [month, type, category, search, startDate, endDate]);

  const visible = useMemo(
    () => transactions.slice(0, page * pageSize),
    [transactions, page, pageSize]
  );

  const hasMore = visible.length < transactions.length;

  const loadMore = useCallback(() => {
    setPage((current) =>
      current * pageSize < transactions.length ? current + 1 : current
    );
  }, [pageSize, transactions.length]);

  return {
    transactions: visible,
    /** Total já filtrado, antes do fatiamento por página. */
    total: transactions.length,
    hasMore,
    loadMore,
    isLoadingMore: false,
    isLoading,
    error,
    mutate,
  };
}
