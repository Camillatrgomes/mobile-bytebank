import type { Observable } from 'rxjs';
import type { StatementQuery, StatementSnapshot } from '../repositories/TransactionRepository';
import type { TransactionDeps } from './createTransaction';

export function watchStatement({ transactions }: TransactionDeps) {
  return (uid: string, query: StatementQuery): Observable<StatementSnapshot> =>
    transactions.watchStatement(uid, query);
}
