import { StyleSheet, Text, View } from 'react-native';

import type { MapPin } from '../../types/map';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '../../constants/theme';

type Props = {
  pins: MapPin[];
};

type MostSpotted = {
  name: string;
  count: number;
};

function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function findMostSpotted(pins: MapPin[]): MostSpotted | null {
  if (pins.length === 0) return null;

  const counts = new Map<string, number>();
  for (const pin of pins) {
    counts.set(pin.pokemonName, (counts.get(pin.pokemonName) ?? 0) + 1);
  }

  let topName: string | null = null;
  let topCount = 0;
  for (const pin of pins) {
    const c = counts.get(pin.pokemonName) ?? 0;
    if (c > topCount) {
      topCount = c;
      topName = pin.pokemonName;
    }
  }

  if (topName === null) return null;
  return { name: topName, count: topCount };
}

export function SightingsStats({ pins }: Props) {
  if (pins.length === 0) return null;

  const totalLocations = pins.length;
  const uniquePokemon = new Set(pins.map((p) => p.pokemonId)).size;
  const mostSpotted = findMostSpotted(pins);

  const locationLabel = totalLocations === 1 ? 'location' : 'locations';

  return (
    <View style={styles.card}>
      <Text style={styles.summaryRow} numberOfLines={1}>
        🗺 {totalLocations} {locationLabel} · {uniquePokemon} unique
      </Text>
      {mostSpotted !== null && (
        <Text style={styles.mostSpotted} numberOfLines={1}>
          ⭐ Most spotted: {capitalize(mostSpotted.name)} ×{mostSpotted.count}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
    marginLeft: SPACING.md,
    maxWidth: 220,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  summaryRow: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  mostSpotted: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
