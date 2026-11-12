export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedData {
  account?: unknown;
  cacheOwner?: string | null;
  cachedAt?: number | null;
}

/** Cache vale se tem conta, dono, está dentro do TTL e é do usuário logado (quando já se sabe quem é). */
export function isCacheUsable(cache: CachedData, uid: string | null, now = Date.now()): boolean {
  const { account, cacheOwner, cachedAt } = cache;
  if (!account || !cacheOwner || typeof cachedAt !== 'number') return false;
  if (now - cachedAt > CACHE_TTL_MS) return false;
  return uid === null || uid === cacheOwner;
}
