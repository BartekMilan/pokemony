import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ListStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ListStackParamList, 'PokemonDetail'>;

export function PokemonDetailScreen({ route }: Props) {
  const { pokemonId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>PokemonDetailScreen</Text>
      <Text style={styles.subtext}>pokemonId: {pokemonId}</Text>
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
  subtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
