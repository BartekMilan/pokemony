import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import { PokemonListScreen } from '../screens/PokemonListScreen';
import type { ListStackParamList } from './types';

const Stack = createNativeStackNavigator<ListStackParamList>();

export function ListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PokemonList"
        component={PokemonListScreen}
        options={{ title: 'Pokémon' }}
      />
      <Stack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={{ title: 'Detail' }}
      />
    </Stack.Navigator>
  );
}
