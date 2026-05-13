import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { TYPE_COLORS } from '../../constants/pokemon';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';

const CHIP_PADDING_V = 6;
const CHIP_PADDING_H = 12;
const FILTER_MARGIN_TOP = 12;
import type { MapPin } from '../../types/map';
import { capitalize } from '../../utils/string';

const ALL_LABEL = 'All';

type Props = {
  pins: MapPin[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
};

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
    marginTop: FILTER_MARGIN_TOP,
    marginHorizontal: SPACING.md,
  },
  scrollContent: {
    paddingRight: SPACING.sm,
  },
  chip: {
    paddingVertical: CHIP_PADDING_V,
    paddingHorizontal: CHIP_PADDING_H,
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
    fontWeight: FONT_WEIGHTS.bold,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  chipTextInactive: {
    color: COLORS.textTertiary,
  },
});
