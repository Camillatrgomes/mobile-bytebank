export const CREDIT_CATEGORIES = [
  'Salário',
  'Investimentos',
  'Reembolso',
  'Transferência recebida',
  'Outros',
] as const;

export const DEBIT_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Contas',
  'Lazer',
  'Saúde',
  'Educação',
  'Compras',
  'Outros',
] as const;

export type CreditCategory = (typeof CREDIT_CATEGORIES)[number];
export type DebitCategory = (typeof DEBIT_CATEGORIES)[number];
export type TransactionCategory = CreditCategory | DebitCategory;
