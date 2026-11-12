import type { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { signedValue, type NewTransactionInput, type Transaction } from '@/domain/entities/Transaction';

// Mesma normalização usada pelo backend ao gravar descriptionLower.
export const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function toTransaction(snapshot: QueryDocumentSnapshot): Transaction {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    type: data.type,
    value: Math.abs(data.value),
    description: data.to ?? data.from ?? data.category ?? '',
    category: data.category ?? 'Outros',
    date: (data.date as Timestamp).toDate().toISOString(),
    receipt: data.urlAnexo ? { name: data.anexo ?? 'recibo', url: data.urlAnexo } : null,
  };
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
