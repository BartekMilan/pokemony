import { memo, useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

import type { MapPin } from '../../types/map';
import { COLORS, SPACING } from '../../constants/theme';
import { capitalize } from '../../utils/string';

type Props = {
  pin: MapPin;
  onPress: (pin: MapPin) => void;
};

export const PokemonMarker = memo(function PokemonMarker({ pin, onPress }: Props) {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const handleLoadEnd = useCallback((): void => {
    setImageLoaded(true);
  }, []);

  const handlePress = useCallback((): void => {
    onPress(pin);
  }, [onPress, pin]);

  return (
    <Marker
      coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
      onPress={handlePress}
      tracksViewChanges={!imageLoaded}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerCard}>
        <Image
          source={{ uri: pin.pokemonSprite }}
          style={styles.markerSprite}
          resizeMode="contain"
          onLoadEnd={handleLoadEnd}
        />
        <Text style={styles.markerLabel} numberOfLines={1}>
          {capitalize(pin.pokemonName)}
        </Text>
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  markerCard: {
    width: 52,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingTop: SPACING.xs,
    paddingBottom: 3,
    alignItems: 'center',
    elevation: 3,
  },
  markerSprite: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
});
