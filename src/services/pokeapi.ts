import type {
  Pokemon,
  PokemonListResponse,
  PokemonSummary,
} from '../types/pokemon';

import { BASE_URL, DEFAULT_LIMIT } from '../constants/api';

export class PokeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly url: string,
  ) {
    super(message);
    this.name = 'PokeApiError';
  }
}

type RawListItem = { name: string; url: string };

type RawListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawListItem[];
};

function extractIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`Could not extract Pokémon ID from URL: ${url}`);
  }
  return Number(match[1]);
}

export async function getPokemonList(
  offset: number,
  limit: number = DEFAULT_LIMIT,
  signal?: AbortSignal,
): Promise<PokemonListResponse> {
  const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new PokeApiError(
        `PokéAPI request failed with status ${response.status}`,
        response.status,
        url,
      );
    }

    const raw = (await response.json()) as RawListResponse;

    const results: PokemonSummary[] = raw.results.map((item) => ({
      id: extractIdFromUrl(item.url),
      name: item.name,
      url: item.url,
    }));

    return {
      count: raw.count,
      next: raw.next,
      previous: raw.previous,
      results,
    };
  } catch (err) {
    if (err instanceof PokeApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    throw new PokeApiError(
      `Network error fetching Pokémon list`,
      null,
      url,
    );
  }
}

export async function getPokemonDetail(id: number, signal?: AbortSignal): Promise<Pokemon> {
  const url = `${BASE_URL}/pokemon/${id}`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new PokeApiError(
        `PokéAPI request failed with status ${response.status}`,
        response.status,
        url,
      );
    }
    return (await response.json()) as Pokemon;
  } catch (err) {
    if (err instanceof PokeApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    throw new PokeApiError(
      `Network error fetching Pokémon ${id}`,
      null,
      url,
    );
  }
}
