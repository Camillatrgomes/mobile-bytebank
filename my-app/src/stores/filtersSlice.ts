import type { StateCreator } from 'zustand';
import type { StatementQuery } from '@/domain/repositories/TransactionRepository';
import type { StoreState } from './index';

export type TransactionTypeFilter = 'all' | 'Credit' | 'Debit';

export interface TransactionFilters {
  /** YYYY-MM; vazio quando o filtro é "Todos os meses" ou há período. */
  month: string;
  type: TransactionTypeFilter;
  category: string;
  search: string;
  /** YYYY-MM-DD, inclusivo. */
  startDate: string | null;
  endDate: string | null;
}

export interface FiltersSlice {
  filters: TransactionFilters;
  setMonth: (month: string) => void;
  setType: (type: TransactionTypeFilter) => void;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  resetFilters: () => void;
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function initialFilters(): TransactionFilters {
  return { month: getCurrentMonth(), type: 'all', category: '', search: '', startDate: null, endDate: null };
}

export const createFiltersSlice: StateCreator<StoreState, [], [], FiltersSlice> = (set) => ({
  filters: initialFilters(),
  setMonth: (month) => set((s) => ({ filters: { ...s.filters, month, startDate: null, endDate: null } })),
  setType: (type) => set((s) => ({ filters: { ...s.filters, type } })),
  setCategory: (category) => set((s) => ({ filters: { ...s.filters, category } })),
  setSearch: (search) => set((s) => ({ filters: { ...s.filters, search } })),
  // Mês e período são exclusivos: com período o mês sai, sem período volta o mês atual.
  setDateRange: (startDate, endDate) =>
    set((s) => ({
      filters: { ...s.filters, startDate, endDate, month: startDate || endDate ? '' : getCurrentMonth() },
    })),
  resetFilters: () => set({ filters: initialFilters() }),
});

function lastDayOfMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);
}

// Datas YYYY-MM-DD ordenam como texto, então a comparação é direta.
const latest = (a: string | null, b: string | null) => (a && b ? (a > b ? a : b) : (a ?? b));
const earliest = (a: string | null, b: string | null) => (a && b ? (a < b ? a : b) : (a ?? b));

/** Mês e período viram um único intervalo inclusivo: a interseção dos dois. */
export function toStatementQuery(filters: TransactionFilters, pageSize: number): StatementQuery {
  const monthStart = filters.month ? `${filters.month}-01` : null;
  const monthEnd = filters.month ? lastDayOfMonth(filters.month) : null;
  return {
    type: filters.type,
    category: filters.category,
    search: filters.search,
    startDate: latest(monthStart, filters.startDate),
    endDate: earliest(monthEnd, filters.endDate),
    pageSize,
  };
}
