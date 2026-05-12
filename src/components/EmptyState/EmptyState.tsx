import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';

type Props = {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function EmptyState({ icon = '🎯', title, subtitle, action }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle !== undefined && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      {action !== undefined && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: {
    marginTop: SPACING.lg,
  },
});
