import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PokemonDetailScreen } from '../screens/PokemonDetailScreen';
import type { ListStackParamList } from './types';
import { ListTopTabs } from './ListTopTabs';

const Stack = createNativeStackNavigator<ListStackParamList>();

export function ListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ListTabs"
        component={ListTopTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PokemonDetail"
        component={PokemonDetailScreen}
        options={{ title: 'Detail' }}
      />
    </Stack.Navigator>
  );
}
