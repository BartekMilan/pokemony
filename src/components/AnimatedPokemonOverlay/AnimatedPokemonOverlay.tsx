import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import type { ISharedValue } from 'react-native-worklets-core';
import type { Bounds } from 'react-native-vision-camera-face-detector';

type Props = {
  sharedBounds: ISharedValue<Bounds | null>;
  spriteUri: string;
  containerWidth: number;
  containerHeight: number;
};

const FALLBACK_SIZE = 80;

export function AnimatedPokemonOverlay({
  sharedBounds,
  spriteUri,
  containerWidth,
  containerHeight,
}: Props) {
  const left = useRef(new Animated.Value(containerWidth / 2 - FALLBACK_SIZE / 2)).current;
  const top = useRef(new Animated.Value(containerHeight / 2 - FALLBACK_SIZE / 2)).current;
  const size = useRef(new Animated.Value(FALLBACK_SIZE)).current;

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const b = sharedBounds.value;
      if (b) {
        const spriteSize = b.width * 1.5;
        left.setValue(b.x + b.width / 2 - spriteSize / 2);
        top.setValue(b.y - spriteSize * 0.3);
        size.setValue(spriteSize);
      } else {
        left.setValue(containerWidth / 2 - FALLBACK_SIZE / 2);
        top.setValue(containerHeight / 2 - FALLBACK_SIZE / 2);
        size.setValue(FALLBACK_SIZE);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [sharedBounds, left, top, size, containerWidth, containerHeight]);

  return (
    <Animated.Image
      source={{ uri: spriteUri }}
      style={[styles.sprite, { left, top, width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  sprite: {
    position: 'absolute',
  },
});
