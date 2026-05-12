import { useEffect, useState } from 'react';

import { getPokemonDetail } from '../services/pokeapi';
import type { Pokemon } from '../types/pokemon';

type UsePokemonDetailResult = {
  pokemon: Pokemon | null;
  isLoading: boolean;
  error: string | null;
};

export function usePokemonDetail(pokemonId: number): UsePokemonDetailResult {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setPokemon(null);

    (async () => {
      try {
        const result = await getPokemonDetail(pokemonId, controller.signal);
        setPokemon(result);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load Pokémon');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [pokemonId]);

  return { pokemon, isLoading, error };
}
