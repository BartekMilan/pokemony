import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { PokemonSummary } from '../../types/pokemon';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';

const SPRITE_SIZE = 64;
const CARD_PADDING_V = 12;
const IMAGE_RADIUS = 8;
const STAR_MARGIN_LEFT = 6;
import { capitalize, formatId } from '../../utils/string';

const SPRITE_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

type Props = {
  pokemon: PokemonSummary;
  onPress: (id: number) => void;
  isFavorite: boolean;
};

export function PokemonCard({ pokemon, onPress, isFavorite }: Props) {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(pokemon.id)}
    >
      <View style={styles.imageWrapper}>
        {!isImageLoaded && (
          <View style={styles.placeholder}>
            <ActivityIndicator size="small" color={COLORS.loadingSpinner} />
          </View>
        )}
        <Image
          source={{ uri: `${SPRITE_BASE_URL}/${pokemon.id}.png` }}
          style={styles.image}
          onLoad={() => setIsImageLoaded(true)}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.id}>{formatId(pokemon.id)}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
          {isFavorite && <Text style={styles.star}>⭐</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.loadingSpinner} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: CARD_PADDING_V,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  pressed: {
    backgroundColor: COLORS.backgroundSubtle,
  },
  imageWrapper: {
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
    marginRight: SPACING.md,
    borderRadius: IMAGE_RADIUS,
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SPRITE_SIZE,
    height: SPRITE_SIZE,
  },
  info: {
    flex: 1,
  },
  id: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  star: {
    marginLeft: STAR_MARGIN_LEFT,
    fontSize: FONT_SIZES.md,
  },
});
