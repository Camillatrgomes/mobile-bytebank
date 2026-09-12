import { z } from 'zod';
import { CREDIT_CATEGORIES, DEBIT_CATEGORIES } from '@/constants/categories';
import { formatCurrency } from '@/lib/formatters';

export const MAX_TRANSACTION_VALUE = 1_000_000;

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
        .refine((v) => (parseAmount(v) ?? 1) > 0, 'O valor deve ser maior que zero')
        .refine((v) => (parseAmount(v) ?? 0) <= MAX_TRANSACTION_VALUE, 'O valor máximo é R$ 1.000.000,00'),
      description: z
        .string()
        .trim()
        .min(3, 'A descrição deve ter ao menos 3 caracteres')
        .max(60, 'A descrição deve ter no máximo 60 caracteres'),
      category: z.string().min(1, 'Selecione uma categoria'),
    })
    .superRefine((data, ctx) => {
      const categories: readonly string[] = data.type === 'Credit' ? CREDIT_CATEGORIES : DEBIT_CATEGORIES;
      if (!categories.includes(data.category)) {
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
