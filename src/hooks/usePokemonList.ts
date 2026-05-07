import { useCallback, useEffect, useRef, useState } from 'react';

import { getPokemonList } from '../services/pokeapi';
import type { PokemonSummary } from '../types/pokemon';

type UsePokemonListResult = {
  pokemon: PokemonSummary[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
};

export function usePokemonList(): UsePokemonListResult {
  const [pokemon, setPokemon] = useState<PokemonSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const isMountedRef = useRef<boolean>(true);
  const inFlightRef = useRef<boolean>(false);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadInitial = useCallback(async (): Promise<void> => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      setError(null);
      const response = await getPokemonList(0);
      if (!isMountedRef.current) return;
      setPokemon(response.results);
      setHasMore(response.next !== null);
      offsetRef.current = response.results.length;
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load Pokémon');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback((): void => {
    if (inFlightRef.current || !hasMore) return;
    inFlightRef.current = true;
    setIsLoadingMore(true);

    void (async () => {
      try {
        setError(null);
        const offset = offsetRef.current;
        const response = await getPokemonList(offset);
        if (!isMountedRef.current) return;
        setPokemon((prev) => [...prev, ...response.results]);
        setHasMore(response.next !== null);
        offsetRef.current = offset + response.results.length;
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to load more');
      } finally {
        if (isMountedRef.current) {
          setIsLoadingMore(false);
        }
        inFlightRef.current = false;
      }
    })();
  }, [hasMore]);

  const refresh = useCallback((): void => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsRefreshing(true);

    void (async () => {
      try {
        setError(null);
        const response = await getPokemonList(0);
        if (!isMountedRef.current) return;
        setPokemon(response.results);
        setHasMore(response.next !== null);
        offsetRef.current = response.results.length;
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to refresh');
      } finally {
        if (isMountedRef.current) {
          setIsRefreshing(false);
          setIsLoading(false);
        }
        inFlightRef.current = false;
      }
    })();
  }, []);

  return {
    pokemon,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
