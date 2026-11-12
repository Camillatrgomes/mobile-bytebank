import { z } from 'zod';
import {
  categoriesFor,
  MAX_DESCRIPTION_LENGTH,
  MAX_TRANSACTION_VALUE,
  MIN_DESCRIPTION_LENGTH,
  type TransactionRuleError,
} from '@/domain/entities/Transaction';
import { formatCurrency } from '@/lib/formatters';

const RULE_MESSAGES: Record<TransactionRuleError, string> = {
  'value-not-positive': 'O valor deve ser maior que zero',
  'value-too-high': 'O valor máximo é R$ 1.000.000,00',
  'description-too-short': `A descrição deve ter ao menos ${MIN_DESCRIPTION_LENGTH} caracteres`,
  'description-too-long': `A descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres`,
  'category-mismatch': 'Categoria inválida para o tipo da transação',
  'insufficient-balance': 'Saldo insuficiente',
};

export const transactionRuleMessage = (error: TransactionRuleError) => RULE_MESSAGES[error];

const DOT_DECIMAL_AMOUNT = /^\d+(\.\d{1,2})?$/;
const BR_AMOUNT = /^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/;

/**
 * Convert "1.234,56", "1234,56" or "1234.56" to a number, or null when the format is invalid
 */
export function parseAmount(text: string): number | null {
  const value = text.trim();
  if (DOT_DECIMAL_AMOUNT.test(value)) return Number(value);
  if (BR_AMOUNT.test(value)) return Number(value.replace(/\./g, '').replace(',', '.'));
  return null;
}

/**
 * Keep only digits and separators while the user types the amount
 */
export function sanitizeAmountInput(text: string): string {
  return text.replace(/[^\d.,]/g, '');
}

/**
 * Show a stored value in the amount field format, e.g. -1234.5 -> "1234,50"
 */
export function formatAmountInput(value: number): string {
  return Math.abs(value).toFixed(2).replace('.', ',');
}

interface TransactionSchemaOptions {
  /** Saldo que uma saída pode consumir. */
  availableBalance: number;
}

export function createTransactionSchema({ availableBalance }: TransactionSchemaOptions) {
  return z
    .object({
      type: z.enum(['Credit', 'Debit']),
      value: z
        .string()
        .trim()
        .min(1, 'Informe o valor')
        .refine((v) => parseAmount(v) !== null, 'Use o formato 1.234,56')
        .refine((v) => (parseAmount(v) ?? 1) > 0, RULE_MESSAGES['value-not-positive'])
        .refine((v) => (parseAmount(v) ?? 0) <= MAX_TRANSACTION_VALUE, RULE_MESSAGES['value-too-high']),
      description: z
        .string()
        .trim()
        .min(MIN_DESCRIPTION_LENGTH, RULE_MESSAGES['description-too-short'])
        .max(MAX_DESCRIPTION_LENGTH, RULE_MESSAGES['description-too-long']),
      category: z.string().min(1, 'Selecione uma categoria'),
    })
    .superRefine((data, ctx) => {
      if (!categoriesFor(data.type).includes(data.category)) {
        ctx.addIssue({
          code: 'custom',
          path: ['category'],
          message: `Categoria inválida para ${data.type === 'Credit' ? 'entrada' : 'saída'}`,
        });
      }

      if (data.type === 'Debit' && (parseAmount(data.value) ?? 0) > availableBalance) {
        ctx.addIssue({
          code: 'custom',
          path: ['value'],
          message: `Saldo insuficiente: disponível ${formatCurrency(Math.max(availableBalance, 0))}`,
        });
      }
    });
}

export type TransactionFormValues = z.input<ReturnType<typeof createTransactionSchema>>;
