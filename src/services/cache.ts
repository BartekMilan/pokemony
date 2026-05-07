import AsyncStorage from '@react-native-async-storage/async-storage';

type CacheEnvelope<T> = {
  value: T;
  cachedAt: number;
};

const memoryCache = new Map<string, CacheEnvelope<unknown>>();

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const memEntry = memoryCache.get(key);
    if (memEntry !== undefined) {
      return memEntry.value as T;
    }
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    memoryCache.set(key, parsed);
    return parsed.value;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T): Promise<void> {
  try {
    const envelope: CacheEnvelope<T> = { value, cachedAt: Date.now() };
    memoryCache.set(key, envelope);
    await AsyncStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Cache writes are best-effort — never propagate failures to callers.
  }
}

export async function getCachedWithTTL<T>(
  key: string,
  ttlMs: number,
): Promise<T | null> {
  try {
    const memEntry = memoryCache.get(key);
    if (memEntry !== undefined) {
      if (Date.now() - memEntry.cachedAt > ttlMs) {
        return null;
      }
      return memEntry.value as T;
    }
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (Date.now() - parsed.cachedAt > ttlMs) {
      return null;
    }
    memoryCache.set(key, parsed);
    return parsed.value;
  } catch {
    return null;
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    memoryCache.delete(key);
    await AsyncStorage.removeItem(key);
  } catch {
    // Best-effort — never propagate failures to callers.
  }
}

export const CACHE_KEYS = {
  POKEMON_DETAIL: (id: number): string => `@cache/pokemon/detail/${id}`,
  POKEMON_LIST: (offset: number, limit: number): string =>
    `@cache/pokemon/list/offset_${offset}_limit_${limit}`,
};
