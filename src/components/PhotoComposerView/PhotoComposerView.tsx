import React, { useCallback, useEffect, useRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { Bounds } from 'react-native-vision-camera-face-detector';

type Props = {
  photoUri: string;
  spriteUri: string;
  faceBounds: Bounds | null;
  cameraViewWidth: number;
  cameraViewHeight: number;
  width: number;
  height: number;
  onReady: () => void;
};

const FALLBACK_SPRITE_SIZE = 120;

function computeSpriteLayout(
  faceBounds: Bounds | null,
  cameraViewWidth: number,
  cameraViewHeight: number,
  composerWidth: number,
  composerHeight: number,
): { left: number; top: number; size: number } {
  if (!faceBounds || cameraViewWidth <= 0 || cameraViewHeight <= 0) {
    return {
      left: composerWidth / 2 - FALLBACK_SPRITE_SIZE / 2,
      top: composerHeight / 2 - FALLBACK_SPRITE_SIZE / 2,
      size: FALLBACK_SPRITE_SIZE,
    };
  }
  const scaleX = composerWidth / cameraViewWidth;
  const scaleY = composerHeight / cameraViewHeight;
  const size = faceBounds.width * scaleX * 1.5;
  const left = (faceBounds.x + faceBounds.width / 2) * scaleX - size / 2;
  const top = faceBounds.y * scaleY - size * 0.3;
  return { left, top, size };
}

export const PhotoComposerView = React.forwardRef<View, Props>(function PhotoComposerView(
  { photoUri, spriteUri, faceBounds, cameraViewWidth, cameraViewHeight, width, height, onReady },
  ref,
) {
  const photoLoadedRef = useRef(false);
  const spriteLoadedRef = useRef(false);
  const readyFiredRef = useRef(false);

  useEffect(() => {
    photoLoadedRef.current = false;
    readyFiredRef.current = false;
    spriteLoadedRef.current = !spriteUri;
  }, [photoUri, spriteUri]);

  const tryFireReady = useCallback(() => {
    if (photoLoadedRef.current && spriteLoadedRef.current && !readyFiredRef.current) {
      readyFiredRef.current = true;
      onReady();
    }
  }, [onReady]);

  const handlePhotoLoad = useCallback(() => {
    photoLoadedRef.current = true;
    tryFireReady();
  }, [tryFireReady]);

  const handleSpriteLoad = useCallback(() => {
    spriteLoadedRef.current = true;
    tryFireReady();
  }, [tryFireReady]);

  const { left, top, size } = computeSpriteLayout(
    faceBounds,
    cameraViewWidth,
    cameraViewHeight,
    width,
    height,
  );

  return (
    <View style={[styles.offScreen, { width, height }]}>
      <View ref={ref} style={{ width, height }} collapsable={false}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onLoad={handlePhotoLoad}
          />
        ) : null}
        {spriteUri ? (
          <Image
            source={{ uri: spriteUri }}
            style={[styles.sprite, { left, top, width: size, height: size }]}
            resizeMode="contain"
            onLoad={handleSpriteLoad}
          />
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  offScreen: {
    position: 'absolute',
    left: -10000,
    top: 0,
    opacity: 0,
  },
  sprite: {
    position: 'absolute',
  },
});
