import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TYPE_COLORS } from '../../constants/pokemon';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import type { MapPin } from '../../types/map';

const ALL_LABEL = 'All';

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
              ? { backgroundColor: COLORS.textSecondary }
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
          const activeColor = TYPE_COLORS[type] ?? COLORS.textSecondary;
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
    marginHorizontal: SPACING.md,
  },
  scrollContent: {
    paddingRight: SPACING.sm,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.pill,
    marginRight: SPACING.sm,
  },
  chipInactive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  chipTextInactive: {
    color: COLORS.textTertiary,
  },
});
