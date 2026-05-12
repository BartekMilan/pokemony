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
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';

const SPRITE_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

type Props = {
  pokemon: PokemonSummary;
  onPress: (id: number) => void;
  isFavorite: boolean;
};

function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

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
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  pressed: {
    backgroundColor: COLORS.backgroundSubtle,
  },
  imageWrapper: {
    width: 64,
    height: 64,
    marginRight: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 64,
    height: 64,
  },
  info: {
    flex: 1,
  },
  id: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  star: {
    marginLeft: 6,
    fontSize: FONT_SIZES.md,
  },
});
