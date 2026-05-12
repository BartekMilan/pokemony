import type {
  Pokemon,
  PokemonListResponse,
  PokemonSummary,
} from '../types/pokemon';

import { BASE_URL, DEFAULT_LIMIT } from '../constants/api';

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
): Promise<PokemonListResponse> {
  const url = `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `PokéAPI request failed with status ${response.status} (${url})`,
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
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Failed to fetch Pokémon list (${url})`);
  }
}

export async function getPokemonDetail(id: number): Promise<Pokemon> {
  const url = `${BASE_URL}/pokemon/${id}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `PokéAPI request failed with status ${response.status} (${url})`,
      );
    }
    return (await response.json()) as Pokemon;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Failed to fetch Pokémon ${id}`);
  }
}
