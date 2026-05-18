import { StyleSheet, Text, View } from 'react-native';

import { useScreenOrientation } from '../hooks/useScreenOrientation';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '../constants/theme';

const ORIENTATION_LABEL: Record<
  ReturnType<typeof useScreenOrientation>,
  string
> = {
  portrait: 'Portrait',
  landscape: 'Landscape',
};

export function NativeTestScreen() {
  const orientation = useScreenOrientation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>expo-settings</Text>
      <Text style={styles.subtitle}>Native module orientation test</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Current orientation</Text>
        <Text style={styles.value}>{ORIENTATION_LABEL[orientation]}</Text>
        <Text style={styles.rawValue}>{orientation}</Text>
      </View>

      <Text style={styles.hint}>
        Rotate your device to verify the value updates from the native module.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: COLORS.backgroundSubtle,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: 36,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  rawValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    lineHeight: 22,
  },
});
