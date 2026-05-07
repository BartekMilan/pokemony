import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import type { TabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<TabParamList, 'Camera'>;

export function CameraScreen(_props: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>CameraScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
});
