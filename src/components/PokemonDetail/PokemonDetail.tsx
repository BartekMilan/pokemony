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
import {
  FALLBACK_TYPE_COLOR,
  MAX_STAT,
  TYPE_COLORS,
} from '../../constants/pokemon';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '../../constants/theme';

type Props = {
  pokemon: Pokemon;
  actionButton: ReactNode;
};

function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

function statPercent(base: number): `${number}%` {
  const pct = Math.min((base / MAX_STAT) * 100, 100);
  return `${pct}%` as `${number}%`;
}

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

      <Text style={styles.id}>{formatId(pokemon.id)}</Text>

      <View style={styles.typeRow}>
        {pokemon.types.map((t) => (
          <View
            key={t.type.name}
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  TYPE_COLORS[t.type.name] ?? FALLBACK_TYPE_COLOR,
              },
            ]}
          >
            <Text style={styles.typeText}>{capitalize(t.type.name)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Height</Text>
          <Text style={styles.metaValue}>
            {(pokemon.height / 10).toFixed(1)} m
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Weight</Text>
          <Text style={styles.metaValue}>
            {(pokemon.weight / 10).toFixed(1)} kg
          </Text>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Base Stats</Text>
        {pokemon.stats.map((s) => (
          <View key={s.stat.name} style={styles.statRow}>
            <Text style={styles.statName}>{s.stat.name}</Text>
            <Text style={styles.statValue}>{s.base_stat}</Text>
            <View style={styles.statBarTrack}>
              <View
                style={[
                  styles.statBarFill,
                  { width: statPercent(s.base_stat) },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

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
    width: 240,
    height: 240,
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
    width: 240,
    height: 240,
  },
  id: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  typeBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.pill,
    marginHorizontal: SPACING.xs,
    marginVertical: 2,
  },
  typeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
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
    fontWeight: '600',
  },
  statsSection: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statName: {
    width: 110,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    textTransform: 'capitalize',
  },
  statValue: {
    width: 36,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginRight: SPACING.sm,
  },
  statBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: COLORS.statBar,
  },
});
