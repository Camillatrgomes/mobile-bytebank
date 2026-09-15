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
 * Apply the DD/MM/AAAA mask while the user types
 */
export function maskDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

/**
 * Convert DD/MM/AAAA to YYYY-MM-DD, or null when the date does not exist
 */
export function parseDateInput(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCDate() !== Number(day) || date.getUTCMonth() !== Number(month) - 1) return null;
  return `${year}-${month}-${day}`;
}

/**
 * Convert YYYY-MM-DD to DD/MM/AAAA
 */
export function formatDateInput(isoDate: string | null): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Check if a date string belongs to a given month (YYYY-MM format)
 */
export function isInMonth(dateStr: string, month: string): boolean {
  if (!month) return true;
  return dateStr.startsWith(month);
}
