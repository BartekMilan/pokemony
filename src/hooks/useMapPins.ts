import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getPokemonDetail } from '../services/pokeapi';
import type { MapPin } from '../types/map';
import {
  FALLBACK_SPRITE,
  MAX_POKEMON_ID,
  MIN_POKEMON_ID,
} from '../constants/pokemon';
import { STORAGE_KEYS } from '../constants/storage';

type StoredPin = Omit<MapPin, 'pokemonTypes'> & { pokemonTypes?: string[] };

type UseMapPinsResult = {
  pins: MapPin[];
  isLoading: boolean;
  addPin: (latitude: number, longitude: number) => Promise<void>;
};

function pickRandomPokemonId(): number {
  const span = MAX_POKEMON_ID - MIN_POKEMON_ID + 1;
  return Math.floor(Math.random() * span) + MIN_POKEMON_ID;
}

export function useMapPins(): UseMapPinsResult {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          const parsed = JSON.parse(raw) as StoredPin[];
          if (Array.isArray(parsed)) {
            const hydrated: MapPin[] = parsed.map((pin) => ({
              ...pin,
              pokemonTypes: pin.pokemonTypes ?? [],
            }));
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
    async (latitude: number, longitude: number): Promise<void> => {
      addPinControllerRef.current?.abort();
      const controller = new AbortController();
      addPinControllerRef.current = controller;

      try {
        const randomId = pickRandomPokemonId();
        const pokemon = await getPokemonDetail(randomId, controller.signal);

        const sprite =
          pokemon.sprites.front_default ??
          pokemon.sprites.other['official-artwork'].front_default ??
          FALLBACK_SPRITE;

        const newPin: MapPin = {
          id: Date.now().toString(),
          latitude,
          longitude,
          pokemonId: pokemon.id,
          pokemonName: pokemon.name,
          pokemonSprite: sprite,
          pokemonTypes: pokemon.types.map((t) => t.type.name),
        };

        setPins((prev) => {
          const next = [...prev, newPin];
          // Persistence is best-effort — fire and forget.
          AsyncStorage.setItem(STORAGE_KEYS.mapPins, JSON.stringify(next)).catch(() => {});
          return next;
        });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        throw err;
      }
    },
    [],
  );

  return { pins, isLoading, addPin };
}
