import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getPokemonDetail } from '../services/pokeapi';
import type { MapPin } from '../types/map';

const MAP_PINS_STORAGE_KEY = '@map_pins';
const MIN_POKEMON_ID = 1;
const MAX_POKEMON_ID = 151;

const FALLBACK_SPRITE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';

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

  const pinsRef = useRef<MapPin[]>([]);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(MAP_PINS_STORAGE_KEY);
        if (cancelled) return;
        if (raw !== null) {
          const parsed = JSON.parse(raw) as MapPin[];
          if (Array.isArray(parsed)) {
            pinsRef.current = parsed;
            setPins(parsed);
          }
        }
      } catch {
        // Reading stored pins must never crash the app — start with an empty list.
      } finally {
        if (!cancelled && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addPin = useCallback(
    async (latitude: number, longitude: number): Promise<void> => {
      try {
        const randomId = pickRandomPokemonId();
        const pokemon = await getPokemonDetail(randomId);

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
        };

        const next = [...pinsRef.current, newPin];
        pinsRef.current = next;
        if (isMountedRef.current) {
          setPins(next);
        }

        try {
          await AsyncStorage.setItem(
            MAP_PINS_STORAGE_KEY,
            JSON.stringify(next),
          );
        } catch {
          // Persistence is best-effort — UI already reflects the new pin.
        }
      } catch {
        // Network failures must not crash the app — silently skip the drop.
      }
    },
    [],
  );

  return { pins, isLoading, addPin };
}
