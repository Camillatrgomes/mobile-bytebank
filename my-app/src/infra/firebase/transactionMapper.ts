import type { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import {
  signedValue,
  type NewTransactionInput,
  type Transaction,
  type TransactionType,
} from '@/domain/entities/Transaction';

/** Transação como o Firestore e a API guardam: valor com sinal e contraparte em to/from. */
export interface TransactionRecord {
  type: TransactionType;
  value: number;
  to?: string | null;
  from?: string | null;
  category?: string | null;
  /** ISO 8601. */
  date: string;
  anexo?: string | null;
  urlAnexo?: string | null;
}

// Mesma normalização usada pelo backend ao gravar descriptionLower.
export const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function fromRecord(id: string, record: TransactionRecord): Transaction {
  return {
    id,
    type: record.type,
    value: Math.abs(record.value),
    description: record.to ?? record.from ?? '',
    category: record.category ?? '',
    date: record.date,
    receipt: record.urlAnexo ? { name: record.anexo ?? '', url: record.urlAnexo } : null,
  };
}

export function toTransaction(snapshot: QueryDocumentSnapshot): Transaction {
  const data = snapshot.data();
  return fromRecord(snapshot.id, {
    ...data,
    date: (data.date as Timestamp).toDate().toISOString(),
  } as TransactionRecord);
}

// Sem recibo novo os campos ficam de fora: no PUT o backend mantém o recibo que já existe.
export function toApiPayload(input: NewTransactionInput) {
  return {
    type: input.type,
    value: signedValue(input),
    to: input.description,
    category: input.category,
    ...(input.receipt && { anexo: input.receipt.name, urlAnexo: input.receipt.url }),
  };
}
