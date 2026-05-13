import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getPokemonDetail } from '../services/pokeapi';
import type { MapPin } from '../types/map';
import type { Pokemon } from '../types/pokemon';
import {
  FALLBACK_SPRITE,
  MAX_POKEMON_ID,
  MIN_POKEMON_ID,
} from '../constants/pokemon';
import { STORAGE_KEYS } from '../constants/storage';

type UseMapPinsResult = {
  pins: MapPin[];
  isLoading: boolean;
  addPin: (latitude: number, longitude: number, pokemon?: Pokemon) => Promise<void>;
};

export function buildPinFromPokemon(
  pokemon: Pokemon,
  lat: number,
  lng: number,
): MapPin {
  const sprite =
    pokemon.sprites.front_default ??
    pokemon.sprites.other['official-artwork'].front_default ??
    FALLBACK_SPRITE;

  return {
    id: Date.now().toString(),
    latitude: lat,
    longitude: lng,
    pokemonId: pokemon.id,
    pokemonName: pokemon.name,
    pokemonSprite: sprite,
    pokemonTypes: pokemon.types.map((t) => t.type.name),
  };
}

function pickRandomPokemonId(): number {
  const span = MAX_POKEMON_ID - MIN_POKEMON_ID + 1;
  return Math.floor(Math.random() * span) + MIN_POKEMON_ID;
}

export function useMapPins(): UseMapPinsResult {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const pinsRef = useRef<MapPin[]>([]);
  const addPinControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      addPinControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.mapPins);
        if (controller.signal.aborted) return;
        if (raw !== null) {
          type StoredPin = Omit<MapPin, 'pokemonTypes'> & {
            pokemonTypes?: string[];
          };
          const parsed = JSON.parse(raw) as StoredPin[];
          if (Array.isArray(parsed)) {
            const hydrated: MapPin[] = parsed.map((pin) => ({
              ...pin,
              pokemonTypes: pin.pokemonTypes ?? [],
            }));
            pinsRef.current = hydrated;
            setPins(hydrated);
          }
        }
      } catch {
        // Reading stored pins must never crash the app — start with an empty list.
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      controller.abort();
    };
  }, []);

  const addPin = useCallback(
    async (
      latitude: number,
      longitude: number,
      pokemon?: Pokemon,
    ): Promise<void> => {
      if (pokemon !== undefined) {
        const newPin = buildPinFromPokemon(pokemon, latitude, longitude);
        const next = [...pinsRef.current, newPin];
        pinsRef.current = next;
        setPins(next);
        try {
          await AsyncStorage.setItem(
            STORAGE_KEYS.mapPins,
            JSON.stringify(next),
          );
        } catch {
          // Persistence is best-effort — UI already reflects the new pin.
        }
        return;
      }

      addPinControllerRef.current?.abort();
      const controller = new AbortController();
      addPinControllerRef.current = controller;

      try {
        const randomId = pickRandomPokemonId();
        const fetched = await getPokemonDetail(randomId, controller.signal);

        const sprite =
          fetched.sprites.front_default ??
          fetched.sprites.other['official-artwork'].front_default ??
          FALLBACK_SPRITE;

        const newPin: MapPin = {
          id: Date.now().toString(),
          latitude,
          longitude,
          pokemonId: fetched.id,
          pokemonName: fetched.name,
          pokemonSprite: sprite,
          pokemonTypes: fetched.types.map((t) => t.type.name),
        };

        const next = [...pinsRef.current, newPin];
        pinsRef.current = next;
        setPins(next);

        try {
          await AsyncStorage.setItem(
            STORAGE_KEYS.mapPins,
            JSON.stringify(next),
          );
        } catch {
          // Persistence is best-effort — UI already reflects the new pin.
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        // Network failures must not crash the app — silently skip the drop.
      }
    },
    [],
  );

  return { pins, isLoading, addPin };
}
