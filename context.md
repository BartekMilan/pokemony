# Project context — Poké Expo app

Single-file orientation for models and humans. Prefer this doc before scanning the repo; verify details in code when implementing.

---

## 1. What this app is

A **React Native (Expo)** client for **[PokéAPI](https://pokeapi.co)** (`https://pokeapi.co/api/v2`). Users browse Pokémon, set **one favorite** (persisted), use an **AR-style camera** (face tracking + sprite overlay + save to gallery) on **Android and iOS** when using a **custom dev client** (`expo run:ios` / `expo run:android`), and view a **Google Map** with **user-placed pins** (each pin is a Pokémon at a lat/lng, persisted locally). List / Favorites / Map work on both platforms where dependencies allow.

Package name in `package.json` is still `temp-app`; display name in Expo config matches (`temp-app`).

---

## 2. Stack

| Layer | Technology |
|--------|------------|
| Runtime | **Expo SDK ~54**, **React 19.1**, **React Native 0.81** |
| Language | **TypeScript** (`strict: true`, extends `expo/tsconfig.base`) |
| Navigation | **React Navigation v7** — `@react-navigation/native`, `bottom-tabs`, `native-stack` |
| Lists | **@shopify/flash-list** |
| Gestures / animation | `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets` + `react-native-worklets-core` |
| Bottom sheet | **@gorhom/bottom-sheet** v5 |
| Maps | **react-native-maps** (Google provider on map screen); API key from env (see §7) |
| Camera | **react-native-vision-camera** v4 + **react-native-vision-camera-face-detector** |
| Capture / compose | **react-native-view-shot**, **expo-image-manipulator**, **expo-media-library**, **expo-location** |
| Persistence | **@react-native-async-storage/async-storage** |
| Icons | **@expo/vector-icons** (Ionicons in tab bar) |
| HTTP | `fetch` in **`src/services/pokeapi.ts` only** (no service layer beyond that file) |
| Lint / format | ESLint (TS + React + RN), Prettier |
| Patches | **patch-package** (`postinstall`) — `patches/` may be empty in some clones |

---

## 3. Architecture (layers)

- **`App.tsx`**: `GestureHandlerRootView` → `FavoritePokemonProvider` → `BottomSheetModalProvider` → `SafeAreaProvider` → `NavigationContainer` → `AppNavigator`.
- **Screens** (`src/screens/*`): orchestration, navigation types, compose hooks + presentational components. **Avoid** putting PokéAPI `fetch` calls directly in screens — use hooks → `pokeapi.ts`.
- **Hooks** (`src/hooks/*`): side effects (API, permissions, storage-adjacent logic, map pins, photo capture pipeline).
- **Services** (`src/services/*`): **`pokeapi.ts`** — pure async HTTP; **`photoComposer.ts`** — image composition helpers for the camera flow. No React imports in services.
- **Context** (`src/contexts/FavoritePokemonContext.tsx`): single favorite `Pokemon` object; AsyncStorage read/write; **`src/hooks/useFavoritePokemon.ts`** re-exports `useFavoritePokemon` for stable import paths.
- **Components** (`src/components/*`): reusable UI; **PokemonBottomSheet** is shared (e.g. Map) — do not duplicate sheet + detail UI.
- **Constants** (`src/constants/*`): `theme.ts`, `api.ts` (`BASE_URL`, `DEFAULT_LIMIT`), `storage.ts` (`STORAGE_KEYS`), `pokemon.ts` (IDs / sprites helpers).
- **Types** (`src/types/*`): `pokemon.ts`, `map.ts` (`MapPin`, etc.).

---

## 4. Navigation

**Root**: bottom tab navigator — `TabParamList` in `src/navigation/types.ts`.

| Tab | Screen(s) | Notes |
|-----|-----------|--------|
| `Favorites` | `FavoritesScreen` | Favorite summary / clear |
| `List` | `ListStack` (native stack) | `PokemonList` → `PokemonDetail` with `{ pokemonId: number }` |
| `Camera` | `CameraScreen` | Vision Camera + face overlay; use a native dev build (not Expo Go alone) |
| `Map` | `MapScreen` | Google Map, pins, long-press add, filters, bottom sheet detail |

Typed with `BottomTabScreenProps` / stack screen props as used in each file.

---

## 5. Project tree (source and entrypoints)

Omit `node_modules`, `.git`, build artifacts — adjust if your clone differs.

```
.
├── App.tsx                 # Root providers + NavigationContainer
├── index.ts                # registerRootComponent(App)
├── app.config.ts           # Full Expo config (merged former app.json + Google Maps keys)
├── babel.config.js
├── tsconfig.json
├── package.json
├── context.md              # This file
├── assets/                 # icon, splash, adaptive icon, favicon
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── ListStack.tsx
│   │   └── types.ts
│   ├── screens/
│   │   ├── PokemonListScreen.tsx
│   │   ├── PokemonDetailScreen.tsx
│   │   ├── FavoritesScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   └── MapScreen.tsx
│   ├── components/
│   │   ├── PokemonCard/
│   │   ├── PokemonBottomSheet/
│   │   ├── PokemonDetail/
│   │   ├── EmptyState/
│   │   ├── TypeFilter/
│   │   ├── SightingsStats/
│   │   ├── CrazyCameraView/
│   │   ├── PhotoComposerView/
│   │   ├── AnimatedPokemonOverlay/
│   │   └── UnsupportedPlatformNotice/
│   ├── hooks/
│   │   ├── useFavoritePokemon.ts    # re-export from context
│   │   ├── usePokemonList.ts
│   │   ├── usePokemonDetail.ts
│   │   ├── useLocation.ts
│   │   ├── useMapPins.ts
│   │   ├── useCameraPermission.ts
│   │   └── useCaptureCrazyPhoto.ts
│   ├── contexts/
│   │   └── FavoritePokemonContext.tsx
│   ├── services/
│   │   ├── pokeapi.ts
│   │   └── photoComposer.ts
│   ├── types/
│   │   ├── pokemon.ts
│   │   └── map.ts
│   └── constants/
│       ├── theme.ts
│       ├── api.ts
│       ├── storage.ts
│       └── pokemon.ts
├── CLAUDE.md               # Human/agent coding conventions (may lag SDK version)
└── patches/                # Used by patch-package when present
```

---

## 6. Main logic and features

### 6.1 PokéAPI and list/detail

- **`getPokemonList(offset, limit?)`** — paginated species list; maps URLs to numeric `id` in `PokemonSummary`.
- **`getPokemonDetail(id)`** — full `Pokemon` JSON as typed in `src/types/pokemon.ts`.
- **`PokeApiError`** — structured errors (`status`, `url`).
- **`usePokemonList` / `usePokemonDetail`** — consume the above for UI loading/error states.

### 6.2 Favorite Pokémon

- **One** favorite stored as full `Pokemon` JSON under `STORAGE_KEYS.favoritePokemon`.
- Context exposes `favorite`, `isLoading`, `setFavorite`, `clearFavorite`.
- **List** may highlight favorite; **Detail** sets favorite; **Favorites** tab shows it; **Camera** requires a favorite for the main flow (otherwise `EmptyState` + CTA to List).

### 6.3 Map

- **`useMapPins`**: loads/saves pin array from `STORAGE_KEYS.mapPins`. Each **`MapPin`**: id, lat/lng, Pokémon id/name/sprite URL, `pokemonTypes` (for filtering).
- **`addPin(lat, lng, pokemon?)`**: if `pokemon` provided, pin uses that species; else fetches a **random** Pokémon id in configured min/max range via **`getPokemonDetail`** (see §8 for signature mismatch).
- **`MapScreen`**: `react-native-maps` + `PROVIDER_GOOGLE`, default region (Warsaw area in code), user location via **`useLocation`**, markers with sprites, **`TypeFilter`** + **`SightingsStats`**, long-press to drop pin, **`PokemonBottomSheet`** for on-marker detail (loads detail via `getPokemonDetail` when needed — see screen file).

### 6.4 Camera (native iOS / Android)

- **`CameraScreen`**: same AR flow on iOS and Android when built with `expo run:*` (Vision Camera + frame processors).
- **`CrazyCameraView`**: Vision Camera + face bounds into shared values.
- **`useCaptureCrazyPhoto`**: permission orchestration, capture, **`composePhotoWithSprite`** (`photoComposer.ts`), optional **`addPin`** at current GPS after save — see hook for full pipeline (media library, image manipulator, location).
- **`PhotoComposerView`**: overlay composition for view-shot / export dimensions.

### 6.5 Shared UI

- **`PokemonCard`**, **`PokemonDetail`**, **`EmptyState`**, **`TypeFilter`**, etc., follow `StyleSheet.create` + theme constants pattern.

---

## 7. Configuration and environment

- **`app.config.ts`** is the **only** Expo static config file (no `app.json` in this layout). Includes plugins: Vision Camera (frame processors), Location strings, `expo-build-properties` (iOS deployment target 16, Android `minSdkVersion` 26).
- **`GOOGLE_MAPS_API_KEY`**: injected at build time into `ios.config.googleMapsApiKey` and `android.config.googleMaps.apiKey`. Required for native Google Maps behavior in dev builds.

---

## 8. Known rough edges (verify when touching)

- **`npx tsc --noEmit`**: may report errors in hooks that pass **`AbortSignal`** or extra args into **`getPokemonDetail`**, which is currently defined as **`getPokemonDetail(id: number)`** only — **`useMapPins`** calls `getPokemonDetail(randomId, controller.signal)`. Align `pokeapi.ts` with callers or adjust callers.
- **`CLAUDE.md`** may still mention **Expo SDK 52** / **`npm test`** — **`package.json`** uses **Expo ~54** and has **no `test` script`** unless added later.
- **iOS bundle id** vs **Android package** differ in `app.config.ts` (historical naming).

---

## 9. Commands

| Command | Purpose |
|---------|---------|
| `npm start` / `npx expo start` | Dev server |
| `npm run ios` / `npm run android` | `expo run:*` native builds |
| `npm run lint` / `npm run lint:fix` | ESLint on `src/**/*.{ts,tsx}` |
| `npm run format` / `npm run format:check` | Prettier on `src/**/*.{ts,tsx}` |
| `npx tsc --noEmit` | Typecheck (see §8) |

---

## 10. Conventions pointer

Human/agent coding rules (naming, exports, “no `any`”, navigation typing) live in **`CLAUDE.md`**. Prefer named exports in `src/`; default export only for root `App.tsx`.
