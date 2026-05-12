import { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { EmptyState } from '../components/EmptyState';
import { PokemonDetail } from '../components/PokemonDetail';
import { useFavoritePokemon } from '../hooks/useFavoritePokemon';
import type { TabParamList } from '../navigation/types';
import { COLORS } from '../constants/theme';

type Props = BottomTabScreenProps<TabParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { favorite, isLoading, clearFavorite } = useFavoritePokemon();

  useEffect(() => {
    if (favorite !== null) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={clearFavorite}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>Remove ✕</Text>
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({ headerRight: undefined });
    }
  }, [favorite, clearFavorite, navigation]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.textSecondary} />
      </View>
    );
  }

  if (favorite === null) {
    return (
      <EmptyState
        icon="🎯"
        title="No favorite yet"
        subtitle="Browse the Pokémon list and set one as your favorite"
      />
    );
  }

  return <PokemonDetail pokemon={favorite} actionButton={null} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  headerButtonText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: '600',
  },
});
