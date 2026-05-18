import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// import { NativeTestScreen } from '../screens/NativeTestScreen';
import { NativeViewTestScreen } from '../screens/NativeViewTestScreen';
import { PokemonListScreen } from '../screens/PokemonListScreen';
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
} from '../constants/theme';
import type { ListTopTabsParamList } from './types';

type TabName = keyof ListTopTabsParamList;

const TABS: { name: TabName; label: string }[] = [
  { name: 'PokemonList', label: 'Pokémon' },
  { name: 'NativeTest', label: 'Native Test' },
];

export function ListTopTabs() {
  const [activeTab, setActiveTab] = useState<TabName>('PokemonList');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.tabBar}>
        {TABS.map(({ name, label }) => {
          const isActive = activeTab === name;
          return (
            <Pressable
              key={name}
              style={styles.tab}
              onPress={() => setActiveTab(name)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {label}
              </Text>
              {isActive ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.content}>
        {activeTab === 'PokemonList' ? (
          <PokemonListScreen />
        ) : (
          <NativeViewTestScreen />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  tabLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.statBar,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: SPACING.lg,
    right: SPACING.lg,
    height: 2,
    backgroundColor: COLORS.statBar,
  },
  content: {
    flex: 1,
  },
});
