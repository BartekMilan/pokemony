import * as React from 'react';
import { ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';

export type ExpoSettingsViewProps = {
  message?: string;
} & ViewProps;

const NativeView =
  requireNativeViewManager<ExpoSettingsViewProps>('ExpoSettings');

export function ExpoSettingsView(props: ExpoSettingsViewProps) {
  return <NativeView {...props} />;
}