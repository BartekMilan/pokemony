import React, { useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useSharedValue } from 'react-native-worklets-core';
import type { Camera } from 'react-native-vision-camera';
import type { Bounds } from 'react-native-vision-camera-face-detector';

import type { TabParamList } from '../../navigation/types';
import type { Pokemon } from '../../types/pokemon';
import { useFavoritePokemon } from '../../hooks/useFavoritePokemon';
import { useCameraPermission } from '../../hooks/useCameraPermission';
import { useMapPins } from '../../hooks/useMapPins';
import { useCaptureCrazyPhoto } from '../../hooks/useCaptureCrazyPhoto';
import { CrazyCameraView } from '../CrazyCameraView';
import { PhotoComposerView } from '../PhotoComposerView';
import { EmptyState } from '../EmptyState';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

export type AndroidCameraContentProps = Pick<
  BottomTabScreenProps<TabParamList, 'Camera'>,
  'navigation'
>;

const EMPTY_POKEMON: Pokemon = {
  id: 0,
  name: '',
  height: 0,
  weight: 0,
  base_experience: 0,
  sprites: { front_default: null, other: { 'official-artwork': { front_default: null } } },
  types: [],
  stats: [],
};

export function AndroidCameraContent({ navigation }: AndroidCameraContentProps) {
  // Type assertion: React 19 useRef returns RefObject<T|null>; hooks expect RefObject<T>
  const cameraRef = useRef<Camera>(null) as React.RefObject<Camera>;
  const composerRef = useRef<View>(null) as React.RefObject<View>;
  const lastFaceBounds = useSharedValue<Bounds | null>(null);
  const [cameraViewWidth, setCameraViewWidth] = useState(1);
  const [cameraViewHeight, setCameraViewHeight] = useState(1);

  const { favorite, isLoading: isFavoriteLoading } = useFavoritePokemon();
  const { hasPermission, isLoading: isPermLoading, request } = useCameraPermission();
  const { addPin } = useMapPins();

  const activeFavorite = favorite ?? EMPTY_POKEMON;

  const { capture, status, composerState, onComposerReady } = useCaptureCrazyPhoto(
    cameraRef,
    composerRef,
    activeFavorite,
    lastFaceBounds,
    addPin,
    cameraViewWidth,
    cameraViewHeight,
  );

  const handleCameraLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCameraViewWidth(width);
    setCameraViewHeight(height);
  }, []);

  const handleNavigateToList = useCallback(() => {
    navigation.navigate('List', { screen: 'PokemonList' });
  }, [navigation]);

  if (isFavoriteLoading || isPermLoading) {
    return <View style={styles.fill} />;
  }

  if (favorite === null) {
    return (
      <EmptyState
        icon="📷"
        title="No Favorite Pokémon Yet"
        subtitle="Pick a favorite to start AR mode"
        action={
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleNavigateToList}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Browse Pokémon</Text>
          </TouchableOpacity>
        }
      />
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSubtitle}>
          Allow camera access to use AR mode.
        </Text>
        <TouchableOpacity
          style={styles.grantButton}
          onPress={request}
          activeOpacity={0.8}
        >
          <Text style={styles.grantButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <View style={styles.fill} onLayout={handleCameraLayout}>
        <CrazyCameraView
          cameraRef={cameraRef}
          sharedBounds={lastFaceBounds}
          favorite={activeFavorite}
          onCapture={capture}
          captureDisabled={status !== 'idle'}
        />
      </View>
      <PhotoComposerView
        ref={composerRef}
        photoUri={composerState?.photoUri ?? ''}
        spriteUri={composerState?.spriteUri ?? ''}
        faceBounds={composerState?.faceBounds ?? null}
        cameraViewWidth={composerState?.cameraViewWidth ?? cameraViewWidth}
        cameraViewHeight={composerState?.cameraViewHeight ?? cameraViewHeight}
        width={composerState?.width ?? 1080}
        height={composerState?.height ?? 1}
        onReady={onComposerReady}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.backgroundSubtle,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  permissionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  grantButton: {
    backgroundColor: COLORS.statBar,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  grantButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: COLORS.statBar,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
