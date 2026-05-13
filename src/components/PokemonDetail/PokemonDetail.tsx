import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Pokemon } from '../../types/pokemon';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';

const ARTWORK_SIZE = 240;
import { capitalize, formatId } from '../../utils/string';
import { PokemonMeta } from './PokemonMeta';
import { StatsList } from './StatsList';
import { TypeBadges } from './TypeBadges';

type Props = {
  pokemon: Pokemon;
  actionButton: ReactNode;
};

export function PokemonDetail({ pokemon, actionButton }: Props) {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const artworkUrl = pokemon.sprites.other['official-artwork'].front_default;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.artworkWrapper}>
        {!isImageLoaded && (
          <View style={styles.artworkPlaceholder}>
            <ActivityIndicator size="large" color={COLORS.loadingSpinner} />
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

      <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
      <Text style={styles.id}>{formatId(pokemon.id)}</Text>

      <TypeBadges types={pokemon.types} />

      <PokemonMeta height={pokemon.height} weight={pokemon.weight} />

      <StatsList stats={pokemon.stats} />

      {actionButton}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  artworkWrapper: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    marginBottom: SPACING.md,
  },
  artworkPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: BORDER_RADIUS.lg,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
  },
  name: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.xs,
  },
  id: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.sm,
  },
});
