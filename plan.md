# Plan: "Crazy Vision Camera" tab (Android-only, VC v4 + live face tracking, risk accepted)

## Context

The `Camera` tab in the Pokédex app (Expo SDK 54.0.33, RN 0.81.5, React 19.1.0, New Architecture, `react-native-worklets@0.8.3`, `react-native-reanimated@4.3.0`) is currently a stub (`src/screens/CameraScreen.tsx` lines 1–25). The spec requires:

1. Live camera preview
2. AI/ML face detection that overlays the user's favorite Pokémon on the detected face (forehead) **— live, on the preview**
3. Capture the augmented image and save to the device's photo library
4. Drop a map pin at the GPS location of capture

**Locked-in decisions (risk accepted by user):**

- **Platform scope:** **Android-only.** iOS short-circuits to an "Android only" notice.
- **Camera + ML stack:** `react-native-vision-camera@^4.7.3` + `react-native-vision-camera-face-detector@^1.4.1` (luicfrr) + `react-native-worklets-core@^1.6.2`. **Live frame-processor face tracking is the spec's most important feature and must be included** — the user has explicitly accepted the risks documented below in exchange for it.
- **No-favorite UX:** Block capture, show `EmptyState` with CTA navigating to the List tab.
- **GPS timing:** Fresh `Location.getCurrentPositionAsync({ accuracy: Balanced })` at capture, in parallel with `takePhoto()`. Do NOT reuse the `useLocation` snapshot.
- **MediaLibrary permission:** Runtime `MediaLibrary.requestPermissionsAsync(true)` (write-only) inside the capture pipeline.
- **`PhotoComposerView` placement:** Always mounted in the React tree, NEVER `display: none`, NEVER conditionally unmounted. Pushed off-screen via `{ position: 'absolute', left: -10000, top: 0, opacity: 0 }`, with `collapsable={false}` on the snapshot target.

## Accepted risks (from validation pass)

The user reviewed the validation findings and chose this path anyway. The risks remain real:

- **VC v4 is archived** ([margelo/react-native-vision-camera-v4-snapshot](https://github.com/mrousavy/react-native-vision-camera)). No upstream patches will ship. PR #3604 (RN 0.81 Kotlin fixes) will likely never merge — our `patch-package` patches are permanent.
- **VC v4's runtime behavior under New Architecture (Fabric) is unverified.** Issue #2614 ("Migrate to new-arch") was never closed in v4; that work became V5. SDK 54 cannot disable the New Architecture. If v4 boots but misbehaves under Fabric, we have no upstream fix path.
- **`react-native-vision-camera-face-detector@1.4.1`** was last tested with RN 0.79.5 + worklets-core 1.6.2 + reanimated 3.9. We force reanimated to 4.3 via npm `overrides`; this may cause runtime crashes if VC v4 calls into reanimated internals (mitigated by routing all worklet code through `worklets-core` instead).
- **Both worklets packages coexist** (`react-native-worklets` for reanimated 4, `react-native-worklets-core` for VC v4's frame processor). Different package names, no install-time conflict, but babel plugin order is load-bearing.

If any of these surface as a build/runtime issue, the fallback is a small, well-defined pivot to the **VC V5 + post-capture ML** plan (preserved in the git history of this file).

---

## Architecture overview

```
CameraScreen (orchestrator)
├── Platform.OS === 'ios' → <UnsupportedPlatformNotice/>
├── favorite === null      → <EmptyState … onCta={navigate('List')}/>
├── permissions not granted → <PermissionGate … />
└── ready
    ├── <Camera> (vision-camera v4)
    │   └── frameProcessor: useFaceDetector() → writes face bounds to a sharedValue
    ├── <AnimatedPokemonOverlay/> (reanimated useAnimatedStyle reads sharedValue → live forehead tracking)
    ├── <PhotoComposerView/> (mounted, off-screen at left: -10000, ref retained)
    └── capture button → useCaptureCrazyPhoto()
        ├── await MediaLibrary.requestPermissionsAsync(true)
        ├── Promise.all([camera.takePhoto(), Location.getCurrentPositionAsync(Balanced)])
        ├── runOnJS read of latest face bounds (deterministic snapshot)
        ├── feed PhotoComposerView state → wait both image onLoads (onReady)
        ├── captureRef(composerRef, { format: 'jpg', quality: 0.92, result: 'tmpfile' })
        ├── MediaLibrary.saveToLibraryAsync(finalUri)
        └── addPin(lat, lng, favorite)
```

Composition uses the *last known* face bounds at the moment of capture (read via `runOnJS` from `sharedValue.value`). If no face is currently tracked, the sprite is placed at the photo center.

---

## Files to MODIFY

| Path | Change |
|---|---|
| `package.json` | **Dependencies:** add `react-native-vision-camera@^4.7.3`, `react-native-vision-camera-face-detector@^1.4.1`, `react-native-worklets-core@^1.6.2`, `react-native-view-shot@^4`, `expo-image-manipulator`. **`overrides` block:** `"react-native-reanimated": "^4.3.0"` — forces reanimated 4 across the dep graph and silences VC v4's pin to 3.9.0. **`devDependencies`:** add `patch-package`. **`scripts`:** add `"postinstall": "patch-package"`. |
| `babel.config.js` | Add `react-native-worklets-core/plugin` to the plugins array **BEFORE** `react-native-reanimated/plugin` (reanimated's plugin must remain last). Result: `plugins: ['react-native-worklets-core/plugin', 'react-native-reanimated/plugin']`. |
| `app.json` | Add `react-native-vision-camera` config-plugin block with `cameraPermissionText` and `enableFrameProcessors: true`. Documentation parity (bare workflow won't auto-apply). |
| `android/app/src/main/AndroidManifest.xml` | Add `<uses-permission android:name="android.permission.CAMERA"/>` and `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>` (Android 13+). Confirm `android:hardwareAccelerated="true"` on `<application>` (required by VC). |
| `ios/tempapp/Info.plist` | **No change.** iOS is out of scope. |
| `src/hooks/useMapPins.ts` | Extend `addPin(latitude, longitude, pokemon?: Pokemon): Promise<void>`. When `pokemon` is supplied, skip `getPokemonDetail`/random ID and build `MapPin` directly. Export `buildPinFromPokemon(pokemon, lat, lng): MapPin`. Non-breaking. |
| `src/screens/CameraScreen.tsx` | Full rewrite (see Step 8). |
| `CLAUDE.md` | Update Tech-Stack: `Camera: react-native-vision-camera v4 (Android-only) + react-native-vision-camera-face-detector + react-native-worklets-core`. Note iOS unsupported. |

## Files to CREATE

| Path | Purpose |
|---|---|
| `patches/react-native-vision-camera+4.7.3.patch` | Two Kotlin compile fixes generated via `patch-package`: (a) `CameraViewManager.kt` — `getExportedCustomDirectEventTypeConstants()` returns `Map<String, Any>?` instead of `MutableMap<String, Any>?`; (b) `CameraViewModule.kt` — change `val activity = currentActivity as? PermissionAwareActivity` to `val activity = reactApplicationContext.currentActivity as? PermissionAwareActivity`. Tracked upstream in PR #3604. |
| `src/hooks/useCameraPermission.ts` | Wraps VC v4's `Camera.requestCameraPermission()` / `Camera.getCameraPermissionStatus()` into `{ hasPermission, isLoading, request }` (mirroring `useLocation`'s shape). |
| `src/hooks/useCaptureCrazyPhoto.ts` | Orchestrator hook. Takes `cameraRef`, `composerRef`, `favorite`, and `lastFaceBounds: SharedValue<FaceBounds \| null>`. Exposes `{ capture(): Promise<void>, status, error }`. Runs runtime-permission → capture → composite → save → addPin. |
| `src/services/photoComposer.ts` | Pure service (no React imports). `composePhotoWithSprite({ composerRef, width, height }): Promise<string>` — calls `captureRef(composerRef, …)`, returns a tmpfile URI. Does NOT instantiate the composer view. |
| `src/components/CrazyCameraView/CrazyCameraView.tsx` + `index.ts` | Active capture view. Mounts `<Camera>` with `useCameraDevice('front')` (default) / `useCameraDevice('back')` (flip toggle). Wires `useFaceDetector({ performanceMode: 'fast', landmarkMode: 'all', minFaceSize: 0.15 })` + `useFrameProcessor` to write face bounds into a worklets-core shared value. Renders the on-preview `<AnimatedPokemonOverlay/>`. |
| `src/components/AnimatedPokemonOverlay/AnimatedPokemonOverlay.tsx` + `index.ts` | Reads `sharedFaceBounds` via reanimated `useAnimatedStyle`; positions an `<Animated.Image/>` at the forehead anchor (mid-eye point raised by 0.6× eye-to-nose distance, width ≈ 1.5× eye distance). Uses `withTiming(value, { duration: 80 })` for smoothing. Falls back to centered when bounds are null. |
| `src/components/PhotoComposerView/PhotoComposerView.tsx` + `index.ts` | Off-screen snapshot view. Props: `{ photoUri, spriteUri, faceBounds, width, height, onReady }`. Tracks `photoLoaded` + `spriteLoaded` and calls `onReady()` exactly once when both flip true. **Container style locked to `{ position: 'absolute', left: -10000, top: 0, width, height, opacity: 0 }`** with `collapsable={false}` on the snapshot-target inner `<View>`. Always mounted in `CameraScreen`'s tree. |
| `src/components/UnsupportedPlatformNotice/UnsupportedPlatformNotice.tsx` + `index.ts` | Renders centered "This feature is currently available only on Android." Uses theme tokens. |
| `src/components/EmptyState/EmptyState.tsx` | Already exists per CLAUDE.md — reuse for "no favorite". Extend with optional `actionLabel`/`onAction` props if needed. |

---

## Step-by-step implementation order

### Step 1 — Native deps, patches, and Android config (gate-keep build first)

1. `npm install react-native-vision-camera@^4.7.3 react-native-vision-camera-face-detector@^1.4.1 react-native-worklets-core@^1.6.2 react-native-view-shot@^4 expo-image-manipulator`.
2. `npm install -D patch-package`.
3. Add to `package.json`:
   - `scripts.postinstall`: `"patch-package"`.
   - `overrides`:
     ```json
     "overrides": {
       "react-native-reanimated": "^4.3.0"
     }
     ```
4. Update `babel.config.js`:
   ```js
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         'react-native-worklets-core/plugin',
         'react-native-reanimated/plugin',
       ],
     };
   };
   ```
   Plugin order is load-bearing: `reanimated/plugin` MUST be last.
5. Edit `node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/CameraViewManager.kt`:
   - Change `override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>?` → `override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>?`.
6. Edit `node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/CameraViewModule.kt`:
   - Replace `val activity = currentActivity as? PermissionAwareActivity` with `val activity = reactApplicationContext.currentActivity as? PermissionAwareActivity`.
7. Run `npx patch-package react-native-vision-camera` to produce `patches/react-native-vision-camera+4.7.3.patch`. Commit this file.
8. Edit `android/app/src/main/AndroidManifest.xml`:
   - Add `<uses-permission android:name="android.permission.CAMERA"/>`.
   - Add `<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>`.
   - Confirm `android:hardwareAccelerated="true"` on `<application>`.
9. Add `react-native-vision-camera` plugin block to `app.json` for documentation parity:
   ```json
   ["react-native-vision-camera", {
     "cameraPermissionText": "Allow temp-app to use your camera to overlay your favorite Pokémon on photos.",
     "enableFrameProcessors": true
   }]
   ```
10. **Verify Android build before any feature work:** `npx expo run:android`. The app should boot and the existing CameraScreen stub should render. **Do not proceed until Android builds AND opens to the CameraScreen stub without crashing.** This validates the patches + babel ordering + native compile. If anything fails here, diagnose now — it'll be much harder once features are wired up.
11. Do NOT run `cd ios && pod install`. iOS is out of scope.

### Step 2 — Extend `useMapPins`

1. Add `buildPinFromPokemon(pokemon: Pokemon, lat: number, lng: number): MapPin`. Sprite via `front_default → other['official-artwork'].front_default → FALLBACK_SPRITE`; types via `pokemon.types.map(t => t.type.name)`.
2. Change `addPin` signature to `(latitude, longitude, pokemon?: Pokemon)`. When `pokemon` supplied: skip `getPokemonDetail`, use `buildPinFromPokemon`, persist, return.
3. Smoke-check `MapScreen` long-press still drops a random Pokémon (parity).

### Step 3 — Permissions hook

1. Create `useCameraPermission` wrapping `Camera.requestCameraPermission()` / `Camera.getCameraPermissionStatus()`. Return `{ hasPermission, isLoading, request }`.

### Step 4 — Live camera + frame-processor face detection (Android path)

1. Build `CrazyCameraView`:
   - `const device = useCameraDevice(isFront ? 'front' : 'back')`; default `isFront = true`.
   - Import `useFaceDetector` from `react-native-vision-camera-face-detector`. `const { detectFaces } = useFaceDetector({ performanceMode: 'fast', landmarkMode: 'all', minFaceSize: 0.15 })`.
   - Import `useSharedValue` **from `react-native-worklets-core`** (not reanimated — VC v4's frame processor runs on worklets-core's runtime). `const sharedBounds = useSharedValue<FaceBounds | null>(null)`.
   - `const frameProcessor = useFrameProcessor((frame) => { 'worklet'; const faces = detectFaces(frame); sharedBounds.value = faces[0]?.bounds ?? null; }, [detectFaces])`.
   - Render `<Camera ref={cameraRef} device={device} isActive frameProcessor={frameProcessor} photo style={StyleSheet.absoluteFill}/>`.
   - Overlay `<AnimatedPokemonOverlay sharedBounds={sharedBounds} spriteUri={favorite.sprite}/>`.
   - Bottom UI: capture button + camera-flip button.
2. **Bridging worklets-core ↔ reanimated for the overlay animation:** The frame processor's `sharedBounds` is a worklets-core shared value. The overlay uses reanimated's `useAnimatedStyle`, which reads reanimated shared values. Bridge by reading `sharedBounds.value` periodically and writing into a reanimated `useSharedValue`:
   - In `AnimatedPokemonOverlay`, create `const reaBounds = useSharedValue<FaceBounds | null>(null)` (reanimated).
   - Inside `frameProcessor` (worklet context), `runOnJS(setReaBounds)(faces[0]?.bounds ?? null)` is too slow; instead use `Worklets.createRunOnJS` once at mount and call it from the frame processor.
   - Or simpler: use reanimated v4's `useFrameCallback` to mirror `sharedBounds.value → reaBounds.value` once per frame.
   - **Alternative (recommended for simplicity):** skip reanimated for the overlay and use RN core `Animated.View` driven by `requestAnimationFrame` that reads `sharedBounds.value` and animates `Animated.Value`s. Slightly less smooth but avoids the cross-runtime bridge entirely.
3. The overlay computes forehead anchor: mid-eye point raised by 0.6× eye-to-nose distance; width = 1.5× eye distance. Falls back to screen-center when bounds are null.

### Step 5 — Capture pipeline (`useCaptureCrazyPhoto`)

1. `capture()`:
   - `const perm = await MediaLibrary.requestPermissionsAsync(true);` If `perm.status !== 'granted'` → set status `error`, abort.
   - Snapshot the worklets-core `sharedBounds.value` into a plain JS object `lastBounds` (since this is read on JS thread, direct `.value` access is allowed for worklets-core).
   - `const [photo, position] = await Promise.all([cameraRef.current.takePhoto({ qualityPrioritization: 'balanced', flash: 'off' }), Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })]);`
   - `let photoUri = 'file://' + photo.path;`
   - If `photo.orientation` indicates rotation, normalize via `expo-image-manipulator`.
   - Lift `{ photoUri, faceBounds: lastBounds }` to `CameraScreen` state (consumed by `PhotoComposerView`). Await the `onReady` callback (both image `onLoad`s fired).
   - `const finalUri = await composePhotoWithSprite({ composerRef, width: COMPOSER_WIDTH, height: COMPOSER_HEIGHT });`
   - `await MediaLibrary.saveToLibraryAsync(finalUri);`
   - `await addPin(position.coords.latitude, position.coords.longitude, favorite);`
2. State machine: `idle | requestingPerm | capturing | composing | saving | done | error`. Capture button disabled outside `idle`. Errors surfaced via `Alert.alert`.

### Step 6 — Composition (`photoComposer.ts` + `PhotoComposerView`)

1. `PhotoComposerView` is **always mounted** in `CameraScreen`'s tree. Container style is locked to `{ position: 'absolute', left: -10000, top: 0, width: COMPOSER_WIDTH, height: COMPOSER_HEIGHT, opacity: 0 }`. Inner snapshot target uses `collapsable={false}`.
2. Component tracks `photoLoaded` + `spriteLoaded`; calls `onReady()` exactly once when both flip true. Resets the flags whenever `photoUri` changes.
3. `COMPOSER_WIDTH = 1080`; `COMPOSER_HEIGHT` derived from `photo.width/height` for matching aspect.
4. `composePhotoWithSprite` is the pure service: `captureRef(ref, { format: 'jpg', quality: 0.92, result: 'tmpfile', width, height })`. No view instantiation inside the service.

### Step 7 — Screen orchestration (`CameraScreen.tsx`)

1. Top-level branch: `Platform.OS === 'ios'` → `<UnsupportedPlatformNotice/>`. No VC code paths run.
2. Android flow:
   - Read `favorite` from `useFavoritePokemon()`.
   - Read `{ hasPermission, request }` from `useCameraPermission()`.
   - Branches:
     - `favorite === null` → `<EmptyState title="No favorite Pokémon yet" description="Pick one to start AR mode" actionLabel="Browse Pokémon" onAction={() => navigation.navigate('List', { screen: 'PokemonList' })}/>`.
     - `hasPermission === false` → `<PermissionGate onGrant={request}/>`.
     - Otherwise → render BOTH the on-screen `<CrazyCameraView/>` AND the off-screen `<PhotoComposerView ref={composerRef} {...composerProps} onReady={onComposerReady}/>`.
3. Screen orchestrates hooks and components only — no service calls.

---

## Reused existing code (do NOT duplicate)

- `useFavoritePokemon` — `src/hooks/useFavoritePokemon.ts` (re-exports from `src/contexts/FavoritePokemonContext.tsx`). Read `favorite`, no writes.
- `useLocation` — `src/hooks/useLocation.ts`. Not used by the capture flow (fresh fix at capture). Optional for a current-location badge.
- `useMapPins` — `src/hooks/useMapPins.ts`. Use the extended `addPin(lat, lng, pokemon)`.
- `STORAGE_KEYS`, `FALLBACK_SPRITE` — `src/constants/storage.ts`, `src/constants/pokemon.ts`. Used in `buildPinFromPokemon`.
- `COLORS`, `SPACING`, `FONT_SIZES`, `BORDER_RADIUS` — `src/constants/theme.ts`. All new component styles use these tokens (no hex literals).
- `EmptyState` — `src/components/EmptyState/`. Reuse, extend props if needed.
- `MapPin` — `src/types/map.ts`. Do not redefine.

---

## Risks & mitigations (with fallbacks if a step fails)

| Risk | Mitigation / Fallback |
|---|---|
| VC v4 Kotlin compile errors on RN 0.81 | `patches/react-native-vision-camera+4.7.3.patch` applied by `patch-package` postinstall. **If patches fail to compile:** check that the Kotlin file paths in `node_modules` match what's referenced in the patch (VC's internal layout can shift between minor versions). |
| VC v4 archived — no upstream fixes | Accepted. **If a future v4 patch is needed:** consider the forks `digital-industry-group/react-native-vision-camera-v4` or pin a working snapshot version. |
| VC v4 runtime behavior on Fabric/New Arch unverified | Step 1.10 gate: boot the unchanged stub app first. **If boot crashes under New Arch:** revisit the V5 + post-capture ML plan (preserved in git history of this file). |
| `react-native-vision-camera-face-detector` v1.4.1 tested only on RN 0.79.5 | The plugin's bridge surface is unchanged in RN 0.81. **If frame processor doesn't emit faces on a real device:** check logcat for native errors; consider patching the plugin's `build.gradle` to declare a compatible MLKit version explicitly. |
| `overrides` to reanimated 4.3 may surface a runtime crash inside VC v4's internal reanimated calls | We route all worklet code through `worklets-core` (Step 4 uses `useSharedValue` from `react-native-worklets-core`, not reanimated). VC v4 only calls reanimated if you opt into its reanimated frame processor path; we don't. **If a startup crash references reanimated internals:** the override may need to be tightened to `react-native-vision-camera` direct deps only via a more targeted `npm overrides` block scoping. |
| MediaLibrary `saveToLibraryAsync` silently no-ops if permission denied | Pipeline calls `MediaLibrary.requestPermissionsAsync(true)` first; aborts on `status !== 'granted'`. |
| `PhotoComposerView` snapshot blank | Always mounted, off-screen at `left: -10000`, `collapsable={false}`. Snapshot gated on explicit `onReady` callback. Reset on every `photoUri` change. |
| Worklets-core ↔ reanimated bridging in `AnimatedPokemonOverlay` | Recommended simplification: use RN core `Animated` driven by a JS-thread interval reading `sharedBounds.value`. Slightly less smooth but avoids cross-runtime issues. |
| Android `takePhoto()` orientation | Normalize via `expo-image-manipulator` before composition. |
| `expo prebuild` could clobber AndroidManifest edits | Plan forbids prebuild. All native edits manual. |
| Stale GPS | Fresh fix via `Location.getCurrentPositionAsync` at capture. |
| Opening Camera on iOS | `Platform.OS === 'ios'` branch renders `<UnsupportedPlatformNotice/>`. |

---

## Critical files to read before implementing

- `src/screens/CameraScreen.tsx` (current stub)
- `src/hooks/useMapPins.ts` (extension target)
- `src/hooks/useLocation.ts` (shape to mirror in `useCameraPermission`)
- `src/contexts/FavoritePokemonContext.tsx` (favorite data shape)
- `src/types/map.ts` and `src/types/pokemon.ts`
- `src/screens/MapScreen.tsx` (verify new pins render correctly)
- `src/components/EmptyState/EmptyState.tsx` (confirm props before reusing)
- `app.json`, `babel.config.js`, `android/app/src/main/AndroidManifest.xml`
- `node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/CameraViewManager.kt`
- `node_modules/react-native-vision-camera/android/src/main/java/com/mrousavy/camera/CameraViewModule.kt`

---

## Verification (Android device — emulator may not have camera support)

After each step, run the appropriate subset:

1. **After Step 1 (native deps + patches):**
   - `ls patches/` shows `react-native-vision-camera+4.7.3.patch`.
   - `npm ls react-native-reanimated` resolves to `^4.3.0` everywhere (no `3.9.0` in tree).
   - `npx expo run:android` boots without build errors; the existing app navigates to CameraScreen stub without crashing.
   - `adb shell dumpsys package com.anonymous.tempapp | grep permission` shows `CAMERA` listed.

2. **After Step 2 (`useMapPins` extension):**
   - `npx tsc --noEmit` passes.
   - Smoke test: long-press on Map tab still drops a random pin (parity).

3. **After Steps 3–4 (live camera + face overlay):**
   - On a real Android device, open Camera tab.
   - Live preview shows; Pokémon sprite tracks the user's face when detected; sits centered when none.
   - Tap camera flip → switches front/back.
   - No favorite set → `EmptyState`; tapping CTA navigates to List tab.
   - Camera permission denied → `PermissionGate`; "Grant" re-prompts.
   - On iOS simulator → `<UnsupportedPlatformNotice/>`; no VC code runs.

4. **After Steps 5–7 (capture + save):**
   - Tap capture → MediaLibrary permission prompt (first time) → grant → image lands in Photos with sprite composited at forehead.
   - Deny MediaLibrary permission → user-visible error; no orphaned files; button returns to `idle`.
   - Switch to Map tab → new pin at current location with the favorite Pokémon's sprite.
   - Airplane mode → capture still succeeds (no network needed).
   - Inspect saved image: forehead-anchored sprite, photo correctly oriented.

5. **Final pass:**
   - `npm run lint` clean.
   - `npm run format:check` clean.
   - `npx tsc --noEmit` clean.
   - Manual smoke test on Android device. iOS smoke test = open tab, confirm "Android only" notice renders.
