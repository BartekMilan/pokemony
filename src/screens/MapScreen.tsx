import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import type { LongPressEvent, Region } from 'react-native-maps';

import { PokemonBottomSheet } from '../components/PokemonBottomSheet';
import { PokemonMarker } from '../components/PokemonMarker';
import { SightingsStats } from '../components/SightingsStats';
import { TypeFilter } from '../components/TypeFilter';
import { useLocation } from '../hooks/useLocation';
import { useMapPins } from '../hooks/useMapPins';
import { useMapPokemonDetail } from '../hooks/useMapPokemonDetail';
import type { TabParamList } from '../navigation/types';
import type { MapPin } from '../types/map';
import { BORDER_RADIUS, COLORS, SPACING } from '../constants/theme';

const DEFAULT_REGION: Region = {
  latitude: 52.2297,
  longitude: 21.0122,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type Props = BottomTabScreenProps<TabParamList, 'Map'>;

export function MapScreen(_props: Props) {
  const { pins, isLoading: isLoadingPins, addPin } = useMapPins();
  const { location, hasPermission } = useLocation();
  const { pokemon: detailPokemon, fetchDetail, clearDetail } = useMapPokemonDetail();
  const insets = useSafeAreaInsets();

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
    async (event: LongPressEvent): Promise<void> => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setIsAddingPin(true);
      try {
        await addPin(latitude, longitude);
      } catch {
        Alert.alert('Failed to add pin', 'Could not fetch a Pokémon. Please try again.');
      } finally {
        setIsAddingPin(false);
      }
    },
    [addPin],
  );

  const handlePinPress = useCallback(
    (pin: MapPin): void => {
      void fetchDetail(pin.pokemonId);
    },
    [fetchDetail],
  );

  const handleSheetClose = useCallback((): void => {
    clearDetail();
  }, [clearDetail]);

  return (
    <View style={styles.root}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={hasPermission}
        onLongPress={handleLongPress}
      >
        {visiblePins.map((pin) => (
          <PokemonMarker
            key={pin.id}
            pin={pin}
            onPress={handlePinPress}
          />
        ))}
      </MapView>

      <View style={[styles.overlayTop, { paddingTop: insets.top }]}>
        <SightingsStats pins={pins} />

        <TypeFilter
          pins={pins}
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />
      </View>

      {isLoadingPins && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={COLORS.statBar} />
        </View>
      )}

      {isAddingPin && (
        <View style={[styles.addingIndicator, { top: insets.top + SPACING.md }]} pointerEvents="none">
          <ActivityIndicator size="small" color={COLORS.statBar} />
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  addingIndicator: {
    position: 'absolute',
    right: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
