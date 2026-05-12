import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PokemonCard } from '../components/PokemonCard';
import { useFavoritePokemon } from '../hooks/useFavoritePokemon';
import { usePokemonList } from '../hooks/usePokemonList';
import type { ListStackParamList } from '../navigation/types';
import type { PokemonSummary } from '../types/pokemon';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';

type Props = NativeStackScreenProps<ListStackParamList, 'PokemonList'>;

export function PokemonListScreen({ navigation }: Props) {
  const {
    pokemon,
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    loadMore,
    refresh,
  } = usePokemonList();
  const { favorite } = useFavoritePokemon();

  const handlePress = useCallback(
    (id: number) => {
      navigation.navigate('PokemonDetail', { pokemonId: id });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: PokemonSummary }) => (
      <PokemonCard
        pokemon={item}
        onPress={handlePress}
        isFavorite={favorite?.id === item.id}
      />
    ),
    [favorite?.id, handlePress],
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.textSecondary} />
      </View>
    );
  }

  if (error !== null && pokemon.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlashList
      data={pokemon}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
      }
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={COLORS.textSecondary} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        !isLoading ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No Pokémon to display.</Text>
          </View>
        ) : null
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
    marginBottom: SPACING.md,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.statBar,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
