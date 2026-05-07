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
            <ActivityIndicator size="small" color="#9ca3af" />
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
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  pressed: {
    backgroundColor: '#f3f4f6',
  },
  imageWrapper: {
    width: 64,
    height: 64,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e5e7eb',
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
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  star: {
    marginLeft: 6,
    fontSize: 14,
  },
});
