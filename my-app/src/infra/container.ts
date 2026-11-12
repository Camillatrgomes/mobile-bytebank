import type { PickedFile } from '@/domain/repositories/ReceiptRepository';
import { attachReceipt } from '@/domain/usecases/attachReceipt';
import { createTransaction } from '@/domain/usecases/createTransaction';
import { deleteTransaction } from '@/domain/usecases/deleteTransaction';
import { updateTransaction } from '@/domain/usecases/updateTransaction';
import { watchStatement } from '@/domain/usecases/watchStatement';
import { FirestoreTransactionRepository } from './repositories/FirestoreTransactionRepository';
import { HttpAccountRepository } from './repositories/HttpAccountRepository';
import { StorageReceiptRepository } from './repositories/StorageReceiptRepository';

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
  provisionAccount: (username: string | null) => accounts.provision(username),
} as const;

export { RECEIPT_TYPES } from './repositories/StorageReceiptRepository';
