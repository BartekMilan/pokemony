import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { LongPressEvent, Region } from 'react-native-maps';

import { PokemonBottomSheet } from '../components/PokemonBottomSheet';
import { SightingsStats } from '../components/SightingsStats';
import { TypeFilter } from '../components/TypeFilter';
import { useLocation } from '../hooks/useLocation';
import { useMapPins } from '../hooks/useMapPins';
import type { TabParamList } from '../navigation/types';
import { getPokemonDetail } from '../services/pokeapi';
import type { MapPin } from '../types/map';
import type { Pokemon } from '../types/pokemon';

const DEFAULT_REGION: Region = {
  latitude: 52.2297,
  longitude: 21.0122,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type Props = BottomTabScreenProps<TabParamList, 'Map'>;

function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function MapScreen(_props: Props) {
  const { pins, isLoading: isLoadingPins, addPin } = useMapPins();
  const { location, hasPermission } = useLocation();

  const [, setSelectedPin] = useState<MapPin | null>(null);
  const [detailPokemon, setDetailPokemon] = useState<Pokemon | null>(null);
  const [isAddingPin, setIsAddingPin] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const visiblePins =
    selectedType === null
      ? pins
      : pins.filter((p) => p.pokemonTypes.includes(selectedType));

  const initialRegion: Region =
    location !== null
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : DEFAULT_REGION;

  const handleLongPress = useCallback(
    (event: LongPressEvent): void => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setIsAddingPin(true);
      void (async () => {
        try {
          await addPin(latitude, longitude);
        } finally {
          setIsAddingPin(false);
        }
      })();
    },
    [addPin],
  );

  const handlePinPress = useCallback((pin: MapPin): void => {
    setSelectedPin(pin);
    void (async () => {
      try {
        const pokemon = await getPokemonDetail(pin.pokemonId);
        setDetailPokemon(pokemon);
      } catch {
        // Network failures must not crash the app — leave the sheet closed.
      }
    })();
  }, []);

  const handleSheetClose = useCallback((): void => {
    setDetailPokemon(null);
    setSelectedPin(null);
  }, []);

  return (
    <View style={styles.root}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={hasPermission}
        onLongPress={handleLongPress}
      >
        {visiblePins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            onPress={() => handlePinPress(pin)}
          >
            <View style={styles.markerContainer}>
              <Image
                source={{ uri: pin.pokemonSprite }}
                style={styles.markerSprite}
                resizeMode="contain"
              />
              <Text style={styles.markerLabel} numberOfLines={1}>
                {capitalize(pin.pokemonName)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <SightingsStats pins={pins} />

      <TypeFilter
        pins={pins}
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {isLoadingPins && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {isAddingPin && (
        <View style={styles.addingIndicator} pointerEvents="none">
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      )}

      <PokemonBottomSheet
        pokemon={detailPokemon}
        onClose={handleSheetClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 3,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  markerSprite: {
    width: 40,
    height: 40,
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addingIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
