/**
 * Format a number as Brazilian Real currency (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format a date string to Brazilian locale (dd/MM/yyyy)
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Format a date string to short format (dd MMM)
 */
export function formatDateShort(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Get the month name from a date string
 */
export function getMonthName(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  } catch {
    return '';
  }
}

/**
 * Get a list of the last N months as { value, label } objects
 */
export function getLastMonths(count = 6): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
    }).format(d);
    months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }

  return months;
}

/**
 * Check if a date string belongs to a given month (YYYY-MM format)
 */
export function isInMonth(dateStr: string, month: string): boolean {
  if (!month) return true;
  return dateStr.startsWith(month);
}
