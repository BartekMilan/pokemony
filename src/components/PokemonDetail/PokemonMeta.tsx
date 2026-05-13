import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';

type Props = {
  height: number;
  weight: number;
};

export function PokemonMeta({ height, weight }: Props) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <Text style={styles.metaLabel}>Height</Text>
        <Text style={styles.metaValue}>{(height / 10).toFixed(1)} m</Text>
      </View>
      <View style={styles.metaItem}>
        <Text style={styles.metaLabel}>Weight</Text>
        <Text style={styles.metaValue}>{(weight / 10).toFixed(1)} kg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
});
