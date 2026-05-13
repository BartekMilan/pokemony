import { useCallback, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import type React from 'react';
import { Camera } from 'react-native-vision-camera';
import type { ISharedValue } from 'react-native-worklets-core';
import type { Bounds } from 'react-native-vision-camera-face-detector';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import type { Pokemon } from '../types/pokemon';
import { composePhotoWithSprite } from '../services/photoComposer';

export type CaptureStatus =
  | 'idle'
  | 'requestingPerm'
  | 'capturing'
  | 'composing'
  | 'saving'
  | 'done'
  | 'error';

export type ComposerState = {
  photoUri: string;
  spriteUri: string;
  faceBounds: Bounds | null;
  cameraViewWidth: number;
  cameraViewHeight: number;
  width: number;
  height: number;
};

type UseCaptureCrazyPhotoResult = {
  capture: () => Promise<void>;
  status: CaptureStatus;
  error: string | null;
  composerState: ComposerState | null;
  onComposerReady: () => void;
};

const COMPOSER_WIDTH = 1080;

const ORIENTATION_ROTATION: Record<string, number> = {
  portrait: 0,
  portraitUpsideDown: 180,
  landscapeLeft: 90,
  landscapeRight: -90,
};

export function useCaptureCrazyPhoto(
  cameraRef: React.RefObject<Camera>,
  composerRef: React.RefObject<View>,
  favorite: Pokemon,
  lastFaceBounds: ISharedValue<Bounds | null>,
  addPin: (lat: number, lng: number, pokemon: Pokemon) => Promise<void>,
  cameraViewWidth: number,
  cameraViewHeight: number,
): UseCaptureCrazyPhotoResult {
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [composerState, setComposerState] = useState<ComposerState | null>(null);

  const isCapturingRef = useRef(false);
  const composerReadyRef = useRef<(() => void) | null>(null);

  const onComposerReady = useCallback(() => {
    composerReadyRef.current?.();
    composerReadyRef.current = null;
  }, []);

  const capture = useCallback(async () => {
    if (isCapturingRef.current) return;
    isCapturingRef.current = true;

    try {
      setError(null);

      setStatus('requestingPerm');
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (perm.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to save captures.',
        );
        setError('Photo library permission denied.');
        setStatus('error');
        return;
      }

      const lastBounds = lastFaceBounds.value;

      setStatus('capturing');
      if (cameraRef.current == null) {
        throw new Error('Camera is not ready.');
      }

      const [photo, position] = await Promise.all([
        cameraRef.current.takePhoto({ flash: 'off' }),
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      ]);

      let photoUri = 'file://' + photo.path;
      const rotation = ORIENTATION_ROTATION[photo.orientation] ?? 0;
      if (rotation !== 0) {
        const normalized = await manipulateAsync(
          photoUri,
          [{ rotate: rotation }],
          { compress: 0.92, format: SaveFormat.JPEG },
        );
        photoUri = normalized.uri;
      }

      const spriteUri =
        favorite.sprites.front_default ??
        favorite.sprites.other['official-artwork'].front_default ??
        '';

      const composerHeight = Math.round((photo.height / photo.width) * COMPOSER_WIDTH);

      setStatus('composing');
      setComposerState({
        photoUri,
        spriteUri,
        faceBounds: lastBounds,
        cameraViewWidth,
        cameraViewHeight,
        width: COMPOSER_WIDTH,
        height: composerHeight,
      });

      await new Promise<void>((resolve) => {
        composerReadyRef.current = resolve;
      });

      const finalUri = await composePhotoWithSprite({
        composerRef,
        width: COMPOSER_WIDTH,
        height: composerHeight,
      });

      setStatus('saving');
      await MediaLibrary.saveToLibraryAsync(finalUri);
      await addPin(position.coords.latitude, position.coords.longitude, favorite);

      setStatus('done');
      setTimeout(() => {
        setStatus('idle');
        setComposerState(null);
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      Alert.alert('Capture Failed', message);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      isCapturingRef.current = false;
    }
  }, [cameraRef, composerRef, favorite, lastFaceBounds, addPin, cameraViewWidth, cameraViewHeight]);

  return { capture, status, error, composerState, onComposerReady };
}
