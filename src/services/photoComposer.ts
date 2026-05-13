import { captureRef } from 'react-native-view-shot';
import type { View } from 'react-native';
import type React from 'react';

type ComposeOptions = {
  composerRef: React.RefObject<View>;
  width: number;
  height: number;
};

export async function composePhotoWithSprite({ composerRef, width, height }: ComposeOptions): Promise<string> {
  return captureRef(composerRef, {
    format: 'jpg',
    quality: 0.92,
    result: 'tmpfile',
    width,
    height,
  });
}
