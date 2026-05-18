export type ScreenOrientation = 'portrait' | 'landscape';

export type OrientationChangeEvent = {
    orientation: ScreenOrientation;
}

export type ExpoSettingsModuleEvents = {
    onOrientationChange: (event: OrientationChangeEvent) => void;
};


