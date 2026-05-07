import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import type { Pokemon } from '../types/pokemon';

const FAVORITE_STORAGE_KEY = '@favorite_pokemon';

let cachedFavorite: Pokemon | null = null;
let isHydrated = false;
const listeners = new Set<(favorite: Pokemon | null) => void>();

function notify(): void {
  for (const listener of listeners) {
    listener(cachedFavorite);
  }
}

type UseFavoritePokemonResult = {
  favorite: Pokemon | null;
  isLoading: boolean;
  setFavorite: (pokemon: Pokemon) => Promise<void>;
  clearFavorite: () => Promise<void>;
};

export function useFavoritePokemon(): UseFavoritePokemonResult {
  const [favorite, setFav] = useState<Pokemon | null>(cachedFavorite);
  const [isLoading, setIsLoading] = useState<boolean>(!isHydrated);

  useEffect(() => {
    const listener = (next: Pokemon | null): void => {
      setFav(next);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAVORITE_STORAGE_KEY);
        if (cancelled) return;
        if (raw !== null) {
          cachedFavorite = JSON.parse(raw) as Pokemon;
        }
        isHydrated = true;
        notify();
      } catch {
        // Reading the favorite must never crash the app — fall through to empty state.
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setFavorite = useCallback(async (pokemon: Pokemon): Promise<void> => {
    cachedFavorite = pokemon;
    notify();
    try {
      await AsyncStorage.setItem(
        FAVORITE_STORAGE_KEY,
        JSON.stringify(pokemon),
      );
    } catch {
      // Persistence is best-effort — UI already reflects the optimistic update.
    }
  }, []);

  const clearFavorite = useCallback(async (): Promise<void> => {
    cachedFavorite = null;
    notify();
    try {
      await AsyncStorage.removeItem(FAVORITE_STORAGE_KEY);
    } catch {
      // Best-effort.
    }
  }, []);

  return { favorite, isLoading, setFavorite, clearFavorite };
}
