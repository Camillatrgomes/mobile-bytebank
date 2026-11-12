import type { Observable } from 'rxjs';
import type { NewTransactionInput, Transaction, TransactionType } from '../entities/Transaction';

export interface StatementQuery {
  readonly type: TransactionType | 'all';
  readonly category: string;
  readonly search: string;
  /** YYYY-MM-DD, inclusivo. */
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly pageSize: number;
}

export interface StatementSnapshot {
  readonly transactions: readonly Transaction[];
  readonly total: number;
  readonly hasMore: boolean;
}

export interface TransactionRepository {
  /** Stream contínuo: reemite a cada mudança no servidor. */
  watchStatement(uid: string, query: StatementQuery): Observable<StatementSnapshot>;
  create(accountId: string, input: NewTransactionInput): Promise<void>;
  update(id: string, input: NewTransactionInput): Promise<void>;
  remove(id: string): Promise<void>;
}
