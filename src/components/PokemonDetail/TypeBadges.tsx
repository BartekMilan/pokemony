import { StyleSheet, Text, View } from 'react-native';

import { FALLBACK_TYPE_COLOR, TYPE_COLORS } from '../../constants/pokemon';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';

const BADGE_PADDING_V = 6;
const BADGE_PADDING_H = 14;
const BADGE_MARGIN_V = 2;
import type { PokemonType } from '../../types/pokemon';
import { capitalize } from '../../utils/string';

type Props = {
  types: PokemonType[];
};

export function TypeBadges({ types }: Props) {
  return (
    <View style={styles.typeRow}>
      {types.map((t) => (
        <View
          key={t.type.name}
          style={[
            styles.typeBadge,
            { backgroundColor: TYPE_COLORS[t.type.name] ?? FALLBACK_TYPE_COLOR },
          ]}
        >
          <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  typeBadge: {
    paddingVertical: BADGE_PADDING_V,
    paddingHorizontal: BADGE_PADDING_H,
    borderRadius: BORDER_RADIUS.pill,
    marginHorizontal: SPACING.xs,
    marginVertical: BADGE_MARGIN_V,
  },
  typeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    textTransform: 'capitalize',
  },
});
