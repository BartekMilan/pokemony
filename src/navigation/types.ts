import type { NavigatorScreenParams } from '@react-navigation/native';

export type ListTopTabsParamList = {
  PokemonList: undefined;
  NativeTest: undefined;
};

export type ListStackParamList = {
  ListTabs: undefined;
  PokemonDetail: { pokemonId: number };
};

export type TabParamList = {
  Favorites: undefined;
  List: NavigatorScreenParams<ListStackParamList>;
  Camera: undefined;
  Map: undefined;
};
