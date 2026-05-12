import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import type { Pokemon } from '../types/pokemon';

const FAVORITE_STORAGE_KEY = '@favorite_pokemon';

type FavoritePokemonContextValue = {
  favorite: Pokemon | null;
  isLoading: boolean;
  setFavorite: (pokemon: Pokemon) => Promise<void>;
  clearFavorite: () => Promise<void>;
};

const FavoritePokemonContext =
  createContext<FavoritePokemonContextValue | null>(null);

type Props = { children: React.ReactNode };

export function FavoritePokemonProvider({ children }: Props): React.ReactElement {
  const [favorite, setFav] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAVORITE_STORAGE_KEY);
        if (cancelled) return;
        if (raw !== null) {
          setFav(JSON.parse(raw) as Pokemon);
        }
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
    setFav(pokemon);
    try {
      await AsyncStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(pokemon));
    } catch {
      // Persistence is best-effort — UI already reflects the optimistic update.
    }
  }, []);

  const clearFavorite = useCallback(async (): Promise<void> => {
    setFav(null);
    try {
      await AsyncStorage.removeItem(FAVORITE_STORAGE_KEY);
    } catch {
      // Best-effort.
    }
  }, []);

  return (
    <FavoritePokemonContext.Provider
      value={{ favorite, isLoading, setFavorite, clearFavorite }}
    >
      {children}
    </FavoritePokemonContext.Provider>
  );
}

export function useFavoritePokemon(): FavoritePokemonContextValue {
  const ctx = useContext(FavoritePokemonContext);
  if (ctx === null) {
    throw new Error(
      'useFavoritePokemon must be used within a FavoritePokemonProvider',
    );
  }
  return ctx;
}
