import { StyleSheet, View } from 'react-native';
import { ExpoSettingsView } from 'expo-settings';
import { COLORS, SPACING } from '../constants/theme';

export function NativeViewTestScreen() {
  return (
    <View style={styles.container}>
      <ExpoSettingsView
        style={styles.nativeView}
        message="Hello from native UI"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    padding: SPACING.xl,
    backgroundColor: COLORS.white
   },
  nativeView: { 
    flex: 1, 
    minHeight: 200
  },
});