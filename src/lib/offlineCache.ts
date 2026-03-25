// Cache local de dados do Supabase para fallback offline

interface CacheEntry<T> {
  data: T;
  timestamp: string;
}

const CACHE_KEYS = {
  entidades: 'cache_entidades',
  lojas: 'cache_lojas',
  produtos: 'cache_produtos',
  lojaEntidades: 'cache_loja_entidades',
} as const;

export type CacheKey = keyof typeof CACHE_KEYS;

export function saveToCache<T>(key: CacheKey, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CACHE_KEYS[key], JSON.stringify(entry));
  } catch (e) {
    console.warn('[OfflineCache] Erro ao salvar cache:', key, e);
  }
}

export function loadFromCache<T>(key: CacheKey): T | null {
  try {
    const raw = localStorage.getItem(CACHE_KEYS[key]);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch (e) {
    console.warn('[OfflineCache] Erro ao ler cache:', key, e);
    return null;
  }
}

export function getCacheTimestamp(key: CacheKey): Date | null {
  try {
    const raw = localStorage.getItem(CACHE_KEYS[key]);
    if (!raw) return null;
    const entry: CacheEntry<unknown> = JSON.parse(raw);
    return new Date(entry.timestamp);
  } catch {
    return null;
  }
}

export function clearCache(): void {
  Object.values(CACHE_KEYS).forEach(k => {
    try { localStorage.removeItem(k); } catch {}
  });
}
