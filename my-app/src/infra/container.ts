import type { PickedFile } from '@/domain/repositories/ReceiptRepository';
import { attachReceipt } from '@/domain/usecases/attachReceipt';
import { createTransaction } from '@/domain/usecases/createTransaction';
import { deleteTransaction } from '@/domain/usecases/deleteTransaction';
import { login } from '@/domain/usecases/login';
import { register } from '@/domain/usecases/register';
import { updateTransaction } from '@/domain/usecases/updateTransaction';
import { watchStatement } from '@/domain/usecases/watchStatement';
import { FirebaseAuthRepository } from './repositories/FirebaseAuthRepository';
import { FirestoreTransactionRepository } from './repositories/FirestoreTransactionRepository';
import { HttpAccountRepository } from './repositories/HttpAccountRepository';
import { StorageReceiptRepository } from './repositories/StorageReceiptRepository';

const auth = new FirebaseAuthRepository();
const transactions = new FirestoreTransactionRepository();
const accounts = new HttpAccountRepository();
const receipts = new StorageReceiptRepository();

export const container = {
  createTransaction: createTransaction({ transactions }),
  updateTransaction: updateTransaction({ transactions }),
  deleteTransaction: deleteTransaction({ transactions }),
  watchStatement: watchStatement({ transactions }),
  attachReceipt: attachReceipt({ receipts }),
  validateReceipt: (file: PickedFile) => receipts.validate(file),
  loadAccount: () => accounts.getSnapshot(),
  login: login({ auth, accounts }),
  register: register({ auth, accounts }),
  logout: () => auth.signOut(),
  updateUsername: (username: string) => auth.updateUsername(username),
  onAuthChanged: auth.onAuthChanged.bind(auth),
} as const;

export { RECEIPT_TYPES } from './repositories/StorageReceiptRepository';
