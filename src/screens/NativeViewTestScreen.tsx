import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING } from '../constants/theme';

export function NativeViewTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>NativeViewTestScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  text: {
    color: COLORS.textPrimary,
  },
});
