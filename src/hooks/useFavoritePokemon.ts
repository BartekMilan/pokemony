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
  error: string | null;
  setFavorite: (pokemon: Pokemon) => Promise<void>;
};

export function useFavoritePokemon(): UseFavoritePokemonResult {
  const [favorite, setFav] = useState<Pokemon | null>(cachedFavorite);
  const [isLoading, setIsLoading] = useState<boolean>(!isHydrated);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load favorite',
        );
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
    try {
      cachedFavorite = pokemon;
      notify();
      await AsyncStorage.setItem(
        FAVORITE_STORAGE_KEY,
        JSON.stringify(pokemon),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save favorite');
    }
  }, []);

  return { favorite, isLoading, error, setFavorite };
}
