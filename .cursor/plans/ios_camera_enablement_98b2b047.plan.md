---
name: iOS camera enablement
overview: Enable the existing Android camera stack on iPhone by removing the deliberate iOS guard in `CameraScreen`, cleaning unused imports, and rebuilding the native iOS app so Vision Camera + frame processors link correctly.
todos:
  - id: remove-ios-guard
    content: Remove iOS early return and unused Platform/UnsupportedPlatformNotice imports in CameraScreen.tsx
    status: pending
  - id: rebuild-ios-device
    content: Rebuild with expo run:ios on physical iPhone and verify camera + capture + save pipeline
    status: pending
  - id: optional-media-plugin
    content: If photo save fails on iOS only, add expo-media-library plugin + permission strings to app.config.ts
    status: pending
isProject: false
---

# Enable Camera tab on iOS (minimal change)

## What blocks iOS today

[`context.md`](context.md) documents that the Camera tab is **Android-only** because the screen short-circuits on iOS. The implementation is explicit in [`src/screens/CameraScreen.tsx`](src/screens/CameraScreen.tsx):

```41:44:src/screens/CameraScreen.tsx
  if (Platform.OS === 'ios') {
    return <UnsupportedPlatformNotice />;
  }
  return <AndroidCameraContent navigation={navigation} />;
```

Everything under `AndroidCameraContent` is already cross-platform: [`CrazyCameraView`](src/components/CrazyCameraView/CrazyCameraView.tsx) (Vision Camera + `useFaceDetector` + frame processor), [`useCameraPermission`](src/hooks/useCameraPermission.ts), [`useCaptureCrazyPhoto`](src/hooks/useCaptureCrazyPhoto.ts) (media library, location, composer). No other `Platform` checks were found in camera-related `src/` files.

Native config is already aligned for a dev build: [`app.config.ts`](app.config.ts) includes the `react-native-vision-camera` plugin with `enableFrameProcessors: true` and `expo-build-properties` iOS `deploymentTarget: '16.0'`, plus camera permission copy.

```47:55:app.config.ts
    [
      'react-native-vision-camera',
      {
        cameraPermissionText:
          'Allow temp-app to use your camera to overlay your favorite Pokémon on photos.',
        enableFrameProcessors: true,
      },
    ],
```

## Planned code changes (smallest diff)

1. **`CameraScreen.tsx`**
   - Remove the `if (Platform.OS === 'ios')` block so iOS renders the same tree as Android.
   - Remove unused imports: `Platform`, `UnsupportedPlatformNotice`.
   - Optionally rename `AndroidCameraContent` to a neutral name (e.g. `CameraTabContent`) for accuracy — **not required** for behavior; skip if you want the absolute smallest diff.

No changes to [`CrazyCameraView`](src/components/CrazyCameraView/CrazyCameraView.tsx), hooks, or [`app.config.ts`](app.config.ts) are **required** purely to “show the camera like Android.”

## How you will run it on a real iPhone

- This project uses **native modules** (Vision Camera, face detector, frame processors). You must use a **custom dev client** built with Expo prebuild, e.g. [`package.json`](package.json) script `npm run ios` (`expo run:ios`), **not** Expo Go alone.
- After the JS change, run a **clean native rebuild** on device so the linked iOS binaries match the app (typical: `expo run:ios` with the device selected).

## Optional follow-up (only if something fails on device)

- **Save to Photos**: If `MediaLibrary.saveToLibraryAsync` fails or never prompts on iOS, add the official **`expo-media-library` config plugin** to [`app.config.ts`](app.config.ts) with the recommended `photosPermission` / `savePhotosPermission` strings so `Info.plist` keys are guaranteed. This is **not** in the current config; Android may have been more forgiving. Treat as a second step if capture works but save does not.
- **Docs**: Update [`context.md`](context.md) §4 / §6.4 to say Camera works on both platforms when built natively — optional, not needed for functionality.

## Out of scope (per your instructions)

- iOS Simulator limitations (no real camera / frame processor constraints) — no code changes targeted at simulator behavior.
