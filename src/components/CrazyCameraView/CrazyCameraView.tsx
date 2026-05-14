import { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  LayoutChangeEvent,
} from 'react-native';

import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
  type CameraPosition,
} from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-worklets-core';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import type { Bounds } from 'react-native-vision-camera-face-detector';
import type { ISharedValue } from 'react-native-worklets-core';

import type { Pokemon } from '../../types/pokemon';
import { AnimatedPokemonOverlay } from '../AnimatedPokemonOverlay';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

type Props = {
  cameraRef: React.RefObject<Camera>;
  sharedBounds: ISharedValue<Bounds | null>;
  favorite: Pokemon;
  onCapture: () => void;
  captureDisabled?: boolean;
};

export function CrazyCameraView({
  cameraRef,
  sharedBounds,
  favorite,
  onCapture,
  captureDisabled = false,
}: Props) {
  const [facing, setFacing] = useState<CameraPosition>('front');
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });

  const device = useCameraDevice(facing);

  const faceDetectorOptions = useMemo(
    () => ({
      performanceMode: 'fast' as const,
      landmarkMode: 'all' as const,
      minFaceSize: 0.15,
      autoMode: true,
      windowWidth: containerSize.width,
      windowHeight: containerSize.height,
      cameraFacing: facing,
    }),
    [containerSize.width, containerSize.height, facing],
  );

  const { detectFaces } = useFaceDetector(faceDetectorOptions);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      const faces = detectFaces(frame);
      sharedBounds.value = faces[0]?.bounds ?? null;
    },
    [detectFaces],
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  }, []);

  const flipCamera = useCallback(() => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  }, []);

  const spriteUri =
    favorite.sprites.front_default ??
    favorite.sprites.other['official-artwork'].front_default ??
    '';

  if (device == null) {
    return (
      <View style={styles.noDevice}>
        <Text style={styles.noDeviceText}>No camera device found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {containerSize.width > 1 && (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          frameProcessor={frameProcessor}
          photo
        />
      )}

      <AnimatedPokemonOverlay
        sharedBounds={sharedBounds}
        spriteUri={spriteUri}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.flipButton}
          onPress={flipCamera}
          activeOpacity={0.7}
        >
          <Text style={styles.flipText}>⟳</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, captureDisabled && styles.captureDisabled]}
          onPress={onCapture}
          disabled={captureDisabled}
          activeOpacity={0.8}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <View style={styles.flipPlaceholder} />
      </View>
    </View>
  );
}

const CAPTURE_BUTTON_SIZE = 72;
const FLIP_BUTTON_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.textPrimary,
  },
  noDevice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.textPrimary,
  },
  noDeviceText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
  },
  controls: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
  },
  flipButton: {
    width: FLIP_BUTTON_SIZE,
    height: FLIP_BUTTON_SIZE,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
  },
  captureButton: {
    width: CAPTURE_BUTTON_SIZE,
    height: CAPTURE_BUTTON_SIZE,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureDisabled: {
    opacity: 0.4,
  },
  captureInner: {
    width: CAPTURE_BUTTON_SIZE - 16,
    height: CAPTURE_BUTTON_SIZE - 16,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.white,
  },
  flipPlaceholder: {
    width: FLIP_BUTTON_SIZE,
  },
});
