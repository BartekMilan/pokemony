import { useCallback, useEffect, useRef, useState } from 'react';

import { getPokemonDetail } from '../services/pokeapi';
import type { Pokemon } from '../types/pokemon';

type UseMapPokemonDetailResult = {
  pokemon: Pokemon | null;
  fetchDetail: (pokemonId: number) => Promise<void>;
  clearDetail: () => void;
};

export function useMapPokemonDetail(): UseMapPokemonDetailResult {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const fetchDetail = useCallback(async (pokemonId: number): Promise<void> => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const result = await getPokemonDetail(pokemonId, controller.signal);
      setPokemon(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      // Network failures must not crash the app — leave the sheet closed.
    }
  }, []);

  const clearDetail = useCallback((): void => {
    controllerRef.current?.abort();
    setPokemon(null);
  }, []);

  return { pokemon, fetchDetail, clearDetail };
}
