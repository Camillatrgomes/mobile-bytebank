import type { Observable } from 'rxjs';
import type { Transaction } from '../entities/Transaction';
import type { TransactionDeps } from './createTransaction';

export function watchAllTransactions({ transactions }: TransactionDeps) {
  return (uid: string): Observable<readonly Transaction[]> => transactions.watchAll(uid);
}
