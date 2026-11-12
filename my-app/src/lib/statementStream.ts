import {
  catchError,
  debounce,
  distinctUntilChanged,
  EMPTY,
  map,
  scan,
  switchMap,
  tap,
  timer,
  type Observable,
} from 'rxjs';
import type { StatementQuery, StatementSnapshot } from '@/domain/repositories/TransactionRepository';

export const SEARCH_DEBOUNCE_MS = 300;

const sameQuery = (a: StatementQuery, b: StatementQuery) =>
  a.type === b.type &&
  a.category === b.category &&
  a.search === b.search &&
  a.startDate === b.startDate &&
  a.endDate === b.endDate &&
  a.pageSize === b.pageSize;

interface Handlers {
  /** Query que não é só a página seguinte da anterior: a tela volta a carregando. */
  onNewQuery: () => void;
  onError: (error: Error) => void;
}

interface Tagged {
  query: StatementQuery;
  delay: number;
}

interface Emitted {
  query: StatementQuery;
  isNew: boolean;
}

/** Só a busca digitada espera o debounce; trocar a query cancela o listener anterior. */
export function statementStream(
  query$: Observable<StatementQuery>,
  watch: (query: StatementQuery) => Observable<StatementSnapshot>,
  { onNewQuery, onError }: Handlers
): Observable<StatementSnapshot> {
  return query$.pipe(
    scan<StatementQuery, Tagged, null>(
      (previous, query) => ({
        query,
        delay: previous && previous.query.search !== query.search ? SEARCH_DEBOUNCE_MS : 0,
      }),
      null
    ),
    debounce(({ delay }) => timer(delay)),
    map(({ query }) => query),
    distinctUntilChanged(sameQuery),
    scan<StatementQuery, Emitted, null>(
      (previous, query) => ({
        query,
        isNew: !previous || !sameQuery({ ...query, pageSize: previous.query.pageSize }, previous.query),
      }),
      null
    ),
    tap(({ isNew }) => isNew && onNewQuery()),
    switchMap(({ query }) =>
      watch(query).pipe(
        catchError((error) => {
          onError(error);
          return EMPTY;
        })
      )
    )
  );
}
