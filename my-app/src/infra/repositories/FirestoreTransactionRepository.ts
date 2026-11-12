import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  type Query,
  type QueryConstraint,
  type QuerySnapshot,
} from 'firebase/firestore';
import type { NewTransactionInput, Transaction } from '@/domain/entities/Transaction';
import type {
  StatementQuery,
  StatementSnapshot,
  TransactionRepository,
} from '@/domain/repositories/TransactionRepository';
import { db } from '../firebase/client';
import { normalizeText, toApiPayload, toTransaction } from '../firebase/transactionMapper';
import { apiFetch } from '../http/apiClient';

const DAY_MS = 86_400_000;
const EMPTY_STATEMENT: StatementSnapshot = { transactions: [], total: 0, hasMore: false };

/** Query base do extrato, ou null quando o período não contém nenhum dia. */
export function buildStatementQuery(uid: string, statement: StatementQuery): Query | null {
  const start = statement.startDate ? Date.parse(statement.startDate) : null;
  const end = statement.endDate ? Date.parse(statement.endDate) + DAY_MS : null;
  if (start !== null && end !== null && start >= end) return null;

  const term = normalizeText(statement.search);
  const constraints: QueryConstraint[] = [];
  if (statement.type !== 'all') constraints.push(where('type', '==', statement.type));
  if (statement.category) constraints.push(where('category', '==', statement.category));
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

function snapshots(target: Query): Observable<QuerySnapshot> {
  return new Observable((subscriber) =>
    onSnapshot(
      target,
      (snapshot) => subscriber.next(snapshot),
      (error) => subscriber.error(error)
    )
  );
}

// Lê direto do Firestore; escreve pela API, porque as rules bloqueiam escrita do cliente.
export class FirestoreTransactionRepository implements TransactionRepository {
  watchAll(uid: string): Observable<readonly Transaction[]> {
    return snapshots(query(collection(db, 'users', uid, 'transactions'), orderBy('date', 'desc'))).pipe(
      map((snapshot) => snapshot.docs.map(toTransaction))
    );
  }

  watchStatement(uid: string, statement: StatementQuery): Observable<StatementSnapshot> {
    const base = buildStatementQuery(uid, statement);
    if (!base) return of(EMPTY_STATEMENT);

    // Um item a mais revela se existe próxima página sem consulta extra.
    return snapshots(query(base, limit(statement.pageSize + 1))).pipe(
      switchMap((snapshot) =>
        from(getCountFromServer(base)).pipe(
          map((count) => count.data().count),
          // Sem rede ou sem permissão a contagem falha; o listener segue vivo com um total aproximado.
          catchError(() => of(null)),
          map(
            (count): StatementSnapshot => ({
              transactions: snapshot.docs.slice(0, statement.pageSize).map(toTransaction),
              total: count ?? Math.min(snapshot.size, statement.pageSize),
              hasMore: snapshot.size > statement.pageSize,
            })
          )
        )
      )
    );
  }

  async create(accountId: string, input: NewTransactionInput): Promise<void> {
    await apiFetch('/account/transaction', {
      method: 'POST',
      body: { accountId, ...toApiPayload(input) },
    });
  }

  async update(id: string, input: NewTransactionInput): Promise<void> {
    await apiFetch(`/account/transaction/${id}`, { method: 'PUT', body: toApiPayload(input) });
  }

  async remove(id: string): Promise<void> {
    await apiFetch(`/account/transaction/${id}`, { method: 'DELETE' });
  }
}
