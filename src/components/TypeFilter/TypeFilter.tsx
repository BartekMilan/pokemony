import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TYPE_COLORS } from '../PokemonDetail';
import type { MapPin } from '../../types/map';

const ALL_LABEL = 'All';
const FALLBACK_TYPE_COLOR = '#6b7280';

type Props = {
  pins: MapPin[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
};

function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function TypeFilter({ pins, selectedType, onSelectType }: Props) {
  const types = useMemo<string[]>(
    () => [...new Set(pins.flatMap((p) => p.pokemonTypes))].sort(),
    [pins],
  );

  if (types.length === 0) return null;

  const isAllActive = selectedType === null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          onPress={() => onSelectType(null)}
          style={[
            styles.chip,
            isAllActive
              ? { backgroundColor: FALLBACK_TYPE_COLOR }
              : styles.chipInactive,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              isAllActive ? styles.chipTextActive : styles.chipTextInactive,
            ]}
          >
            {ALL_LABEL}
          </Text>
        </Pressable>

        {types.map((type) => {
          const isActive = selectedType === type;
          const activeColor = TYPE_COLORS[type] ?? FALLBACK_TYPE_COLOR;
          return (
            <Pressable
              key={type}
              onPress={() => onSelectType(type)}
              style={[
                styles.chip,
                isActive
                  ? { backgroundColor: activeColor }
                  : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {capitalize(type)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    marginHorizontal: 16,
  },
  scrollContent: {
    paddingRight: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
  },
  chipInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  chipTextInactive: {
    color: '#374151',
  },
});
