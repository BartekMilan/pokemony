import type { NavigatorScreenParams } from '@react-navigation/native';

export type ListStackParamList = {
  PokemonList: undefined;
  PokemonDetail: { pokemonId: number };
};

export type TabParamList = {
  Favorites: undefined;
  List: NavigatorScreenParams<ListStackParamList>;
  Camera: undefined;
  Map: undefined;
};
