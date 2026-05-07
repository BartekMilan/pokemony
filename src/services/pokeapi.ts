import type {
  Pokemon,
  PokemonListResponse,
  PokemonSummary,
} from '../types/pokemon';
import {
  CACHE_KEYS,
  getCached,
  getCachedWithTTL,
  invalidateCache,
  setCached,
} from './cache';

const BASE_URL = 'https://pokeapi.co/api/v2';
const DEFAULT_LIMIT = 20;
const LIST_TTL_MS = 24 * 60 * 60 * 1000;

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

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'network error';
    throw new Error(`Failed to reach PokéAPI (${url}): ${message}`);
  }

  if (!response.ok) {
    throw new Error(
      `PokéAPI request failed with status ${response.status} (${url})`,
    );
  }

  try {
    return (await response.json()) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid JSON';
    throw new Error(`PokéAPI returned invalid JSON (${url}): ${message}`);
  }
}

export async function getPokemonList(
  offset: number,
  limit: number = DEFAULT_LIMIT,
  forceRefresh = false,
): Promise<PokemonListResponse> {
  const key = CACHE_KEYS.POKEMON_LIST(offset, limit);

  if (forceRefresh) {
    await invalidateCache(key);
  } else {
    const cached = await getCachedWithTTL<PokemonListResponse>(key, LIST_TTL_MS);
    if (cached !== null) {
      return cached;
    }
  }

  const raw = await fetchJson<RawListResponse>(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`,
  );

  const results: PokemonSummary[] = raw.results.map((item) => ({
    id: extractIdFromUrl(item.url),
    name: item.name,
    url: item.url,
  }));

  const response: PokemonListResponse = {
    count: raw.count,
    next: raw.next,
    previous: raw.previous,
    results,
  };

  await setCached(key, response);
  return response;
}

export async function getPokemonDetail(id: number): Promise<Pokemon> {
  const key = CACHE_KEYS.POKEMON_DETAIL(id);
  const cached = await getCached<Pokemon>(key);
  if (cached !== null) {
    return cached;
  }

  const detail = await fetchJson<Pokemon>(`${BASE_URL}/pokemon/${id}`);
  await setCached(key, detail);
  return detail;
}
