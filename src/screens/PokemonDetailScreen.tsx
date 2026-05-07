import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFavoritePokemon } from '../hooks/useFavoritePokemon';
import { usePokemonDetail } from '../hooks/usePokemonDetail';
import type { ListStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ListStackParamList, 'PokemonDetail'>;

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const FALLBACK_TYPE_COLOR = '#9ca3af';
const MAX_STAT = 255;

function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

function statPercent(base: number): `${number}%` {
  const pct = Math.min((base / MAX_STAT) * 100, 100);
  return `${pct}%` as `${number}%`;
}

export function PokemonDetailScreen({ route, navigation }: Props) {
  const { pokemonId } = route.params;
  const { pokemon, isLoading, error } = usePokemonDetail(pokemonId);
  const { favorite, setFavorite } = useFavoritePokemon();
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (pokemon !== null) {
      navigation.setOptions({ title: capitalize(pokemon.name) });
    }
  }, [pokemon, navigation]);

  const handleSetFavorite = useCallback(async () => {
    if (pokemon === null) return;
    await setFavorite(pokemon);
    navigation.goBack();
  }, [pokemon, setFavorite, navigation]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6b7280" />
      </View>
    );
  }

  if (error !== null || pokemon === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Pokémon not found.'}</Text>
      </View>
    );
  }

  const artworkUrl = pokemon.sprites.other['official-artwork'].front_default;
  const isAlreadyFavorite = favorite?.id === pokemon.id;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.artworkWrapper}>
        {!isImageLoaded && (
          <View style={styles.artworkPlaceholder}>
            <ActivityIndicator size="large" color="#9ca3af" />
          </View>
        )}
        {artworkUrl !== null && (
          <Image
            source={{ uri: artworkUrl }}
            style={styles.artwork}
            resizeMode="contain"
            onLoad={() => setIsImageLoaded(true)}
          />
        )}
      </View>

      <Text style={styles.id}>{formatId(pokemon.id)}</Text>

      <View style={styles.typeRow}>
        {pokemon.types.map((t) => (
          <View
            key={t.type.name}
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  TYPE_COLORS[t.type.name] ?? FALLBACK_TYPE_COLOR,
              },
            ]}
          >
            <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Height</Text>
          <Text style={styles.metaValue}>
            {(pokemon.height / 10).toFixed(1)} m
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Weight</Text>
          <Text style={styles.metaValue}>
            {(pokemon.weight / 10).toFixed(1)} kg
          </Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Base Stats</Text>
        {pokemon.stats.map((s) => (
          <View key={s.stat.name} style={styles.statRow}>
            <Text style={styles.statName}>{s.stat.name}</Text>
            <Text style={styles.statValue}>{s.base_stat}</Text>
            <View style={styles.statBarTrack}>
              <View
                style={[
                  styles.statBarFill,
                  { width: statPercent(s.base_stat) },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.favoriteButton,
          isAlreadyFavorite && styles.favoriteButtonDisabled,
        ]}
        onPress={handleSetFavorite}
        disabled={isAlreadyFavorite}
      >
        <Text style={styles.favoriteButtonText}>
          {isAlreadyFavorite ? 'Already your favorite ⭐' : 'Set as Favorite'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#b91c1c',
    textAlign: 'center',
  },
  artworkWrapper: {
    width: 240,
    height: 240,
    marginBottom: 16,
  },
  artworkPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  artwork: {
    width: 240,
    height: 240,
  },
  id: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  typeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },
  statsSection: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statName: {
    width: 110,
    fontSize: 13,
    color: '#374151',
    textTransform: 'capitalize',
  },
  statValue: {
    width: 36,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    marginRight: 8,
  },
  statBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  favoriteButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    alignItems: 'center',
  },
  favoriteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  favoriteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
