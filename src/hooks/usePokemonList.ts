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

  const inFlightRef = useRef<boolean>(false);
  const offsetRef = useRef<number>(0);
  const activeControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeControllerRef.current?.abort();
    };
  }, []);

  const loadInitial = useCallback(async (signal: AbortSignal): Promise<void> => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      setError(null);
      const response = await getPokemonList(0, undefined, signal);
      setPokemon(response.results);
      setHasMore(response.next !== null);
      offsetRef.current = response.results.length;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load Pokémon');
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadInitial(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadInitial]);

  const loadMore = useCallback((): void => {
    if (inFlightRef.current || !hasMore) return;
    inFlightRef.current = true;
    setIsLoadingMore(true);

    const controller = new AbortController();
    activeControllerRef.current = controller;
    const { signal } = controller;

    void (async () => {
      try {
        setError(null);
        const offset = offsetRef.current;
        const response = await getPokemonList(offset, undefined, signal);
        setPokemon((prev) => [...prev, ...response.results]);
        setHasMore(response.next !== null);
        offsetRef.current = offset + response.results.length;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load more');
      } finally {
        if (!signal.aborted) {
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

    const controller = new AbortController();
    activeControllerRef.current = controller;
    const { signal } = controller;

    void (async () => {
      try {
        setError(null);
        const response = await getPokemonList(0, undefined, signal);
        setPokemon(response.results);
        setHasMore(response.next !== null);
        offsetRef.current = response.results.length;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to refresh');
      } finally {
        if (!signal.aborted) {
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
