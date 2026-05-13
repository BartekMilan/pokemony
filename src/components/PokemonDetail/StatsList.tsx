import { StyleSheet, Text, View } from 'react-native';

import { MAX_STAT } from '../../constants/pokemon';
import { BORDER_RADIUS, COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING } from '../../constants/theme';

const STAT_NAME_WIDTH = 110;
const STAT_VALUE_WIDTH = 36;
const STAT_BAR_HEIGHT = 8;
const SECTION_TITLE_MB = 12;
import type { PokemonStat } from '../../types/pokemon';

type Props = {
  stats: PokemonStat[];
};

function statPercent(base: number): `${number}%` {
  const pct = Math.min((base / MAX_STAT) * 100, 100);
  return `${pct}%` as `${number}%`;
}

export function StatsList({ stats }: Props) {
  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Base Stats</Text>
      {stats.map((s) => (
        <View key={s.stat.name} style={styles.statRow}>
          <Text style={styles.statName}>{s.stat.name}</Text>
          <Text style={styles.statValue}>{s.base_stat}</Text>
          <View style={styles.statBarTrack}>
            <View style={[styles.statBarFill, { width: statPercent(s.base_stat) }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SECTION_TITLE_MB,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statName: {
    width: STAT_NAME_WIDTH,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    textTransform: 'capitalize',
  },
  statValue: {
    width: STAT_VALUE_WIDTH,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginRight: SPACING.sm,
  },
  statBarTrack: {
    flex: 1,
    height: STAT_BAR_HEIGHT,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: COLORS.statBar,
  },
});
