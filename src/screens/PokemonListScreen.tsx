import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ListStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ListStackParamList, 'PokemonList'>;

export function PokemonListScreen(_props: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>PokemonListScreen</Text>
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
