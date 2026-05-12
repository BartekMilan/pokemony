import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PokemonDetail } from '../components/PokemonDetail';
import { useFavoritePokemon } from '../hooks/useFavoritePokemon';
import { usePokemonDetail } from '../hooks/usePokemonDetail';
import type { ListStackParamList } from '../navigation/types';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '../constants/theme';

type Props = NativeStackScreenProps<ListStackParamList, 'PokemonDetail'>;

function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function PokemonDetailScreen({ route, navigation }: Props) {
  const { pokemonId } = route.params;
  const { pokemon, isLoading, error } = usePokemonDetail(pokemonId);
  const { favorite, setFavorite } = useFavoritePokemon();

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
        <ActivityIndicator size="large" color={COLORS.textSecondary} />
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

  const isFavorite = pokemon.id === favorite?.id;

  return (
    <PokemonDetail
      pokemon={pokemon}
      actionButton={
        <TouchableOpacity
          onPress={handleSetFavorite}
          disabled={isFavorite}
          style={[styles.button, isFavorite && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {isFavorite ? 'Already your favorite ⭐' : 'Set as Favorite'}
          </Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: COLORS.statBar,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.loadingSpinner,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
