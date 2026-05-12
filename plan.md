# Refactoring Plan — Security, State Management, Constants, Error Handling

## Context

The codebase is a React Native / Expo 52 Pokédex app in good shape overall, but has four categories of issues:
1. A live Google Maps API key is hardcoded in `app.json` and committed to git.
2. `useFavoritePokemon` uses module-level mutable variables and a hand-rolled pub/sub pattern — a React anti-pattern that breaks Fast Refresh and makes testing unreliable.
3. Domain constants (`TYPE_COLORS`, `MAX_STAT`, `BASE_URL`, `DEFAULT_LIMIT`, etc.) are scattered across components and services instead of living in `src/constants/`.
4. Error handling in `pokeapi.ts` uses generic `Error` objects, making it hard for callers to distinguish API errors from network errors.

---

## Step 1 — Security: Move the Google Maps API Key Out of Source [ZROBIONE]

**Files affected:** `.gitignore`, `app.json`, new `app.config.ts`, new `.env`, new `.env.example`

### 1.0 — Revoke the exposed key immediately

The key `AIzaSyDO6OajJtSbqyx0yXlCfKCQYDVFu5zNB9k` is already in git history and must be considered compromised. Before doing anything else:

1. Open **Google Cloud Console → APIs & Services → Credentials**.
2. Find the key and click **Regenerate key** (or delete it and create a new one).
3. Copy the new key — it will be the value placed in `.env` in step 1.2.

Moving the old key to `.env` without revoking it does **not** fix the security issue.

### 1.1 — Fix `.gitignore`

The current entry `.env*.local` does **not** match `.env`. Add a plain `.env` line:

```
# local env files
.env
.env*.local
```

### 1.2 — Create `.env`

Create `.env` in the project root (never committed). Use the **new** key from step 1.0:

```
GOOGLE_MAPS_API_KEY=<new_key_from_google_cloud_console>
```

Also create `.env.example` (committed) as onboarding documentation:

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 1.3 — Create `app.config.ts`

Expo SDK 49+ automatically loads `.env` before evaluating this file, so `process.env` works without installing `dotenv`. The file merges with `app.json` (this file wins on conflicts).

```typescript
import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
  ios: {
    ...config.ios,
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
    },
  },
});
```

### 1.4 — Remove the hardcoded key from `app.json`

Delete the `android.config.googleMaps` block from `app.json`. It is now supplied exclusively by `app.config.ts`.

---

## Step 2 — State Management: Refactor `useFavoritePokemon` to React Context [ZROBIONE]

**Files affected:** new `src/contexts/FavoritePokemonContext.tsx`, `src/hooks/useFavoritePokemon.ts` (rewritten), `App.tsx`

### Why the current code is an anti-pattern

`useFavoritePokemon.ts` holds three module-level variables (`cachedFavorite`, `isHydrated`, `listeners`) that persist across component mounts and are never reset by React. This:
- Silently survives Fast Refresh (stale state after a hot reload)
- Makes unit tests share state between test cases unless modules are manually reset
- Re-implements React Context by hand, without its lifecycle guarantees

### 2.1 — Create `src/contexts/FavoritePokemonContext.tsx`

The Provider owns all state and the AsyncStorage hydration. It exposes the same public API the hook currently exposes (`favorite`, `isLoading`, `setFavorite`, `clearFavorite`).

Key implementation notes:
- Use `useState<Pokemon | null>(null)` and `useState<boolean>(true)` — no module-level variables.
- Run the hydration `useEffect` inside the Provider (runs once when the app mounts).
- `setFavorite` and `clearFavorite` are `useCallback` functions that update React state then persist to AsyncStorage (same optimistic pattern as today).
- Import `STORAGE_KEYS` from `src/constants/storage.ts` (created in step 3.4) instead of using a raw string.
- Export two things: `FavoritePokemonProvider` and `useFavoritePokemon`.
- `useFavoritePokemon` throws a descriptive error if called outside the Provider (defensive guard).

### 2.2 — Rewrite `src/hooks/useFavoritePokemon.ts`

The file becomes a one-line re-export pointing to the context hook:

```typescript
export { useFavoritePokemon } from '../contexts/FavoritePokemonContext';
```

The module-level `cachedFavorite`, `isHydrated`, `listeners`, and `notify` are gone.

### 2.3 — Wrap `App.tsx` with `<FavoritePokemonProvider>`

Add the Provider immediately inside `GestureHandlerRootView`, wrapping everything else. No change to any screen or component — they continue calling `useFavoritePokemon()` as before.

### Note on `useMapPins`

`useMapPins` is not an anti-pattern. It uses local `useState` + `useRef` and is consumed only by `MapScreen`. No refactoring needed for state management.

---

## Step 3 — Constants Extraction

**Files affected:** new `src/constants/api.ts`, new `src/constants/pokemon.ts`, new `src/constants/theme.ts`, new `src/constants/storage.ts`, `src/services/pokeapi.ts`, `src/hooks/useFavoritePokemon.ts`, `src/hooks/useMapPins.ts`, and all components/screens listed in step 3.3.

### 3.1 — Create `src/constants/api.ts`

Move from `pokeapi.ts`:

```typescript
export const BASE_URL = 'https://pokeapi.co/api/v2';
export const DEFAULT_LIMIT = 20;
```

Update imports in `src/services/pokeapi.ts`.

### 3.2 — Create `src/constants/pokemon.ts`

Move from `PokemonDetail.tsx` and `useMapPins.ts`:

```typescript
export const TYPE_COLORS: Record<string, string> = { /* existing 18 entries */ };
export const FALLBACK_TYPE_COLOR = '#9ca3af';
export const MAX_STAT = 255;
export const MIN_POKEMON_ID = 1;
export const MAX_POKEMON_ID = 151;
export const FALLBACK_SPRITE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
```

Update imports in `PokemonDetail.tsx` (`TYPE_COLORS`, `FALLBACK_TYPE_COLOR`, `MAX_STAT`) and `useMapPins.ts` (`MIN_POKEMON_ID`, `MAX_POKEMON_ID`, `FALLBACK_SPRITE`).

### 3.3 — Create `src/constants/theme.ts` and apply to ALL affected files

Centralise UI colour tokens currently scattered as hex literals in `StyleSheet.create` blocks:

```typescript
export const COLORS = {
  textPrimary:      '#111827',
  textSecondary:    '#6b7280',
  textTertiary:     '#374151',
  white:            '#ffffff',
  backgroundSubtle: '#f3f4f6',
  border:           '#e5e7eb',
  statBar:          '#2563eb',
  loadingSpinner:   '#9ca3af',
  divider:          '#d1d5db',
};

export const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 20, xl: 24, xxl: 40,
};

export const FONT_SIZES = {
  xs: 12, sm: 13, md: 14, lg: 16, xl: 18,
};

export const BORDER_RADIUS = {
  sm: 4, md: 12, lg: 16, pill: 999,
};
```

Replace bare hex strings and magic numbers in **every** file that uses them:

| File | Token(s) used |
|------|--------------|
| `src/components/EmptyState/EmptyState.tsx` | `textSecondary`, `textPrimary` |
| `src/components/PokemonCard/PokemonCard.tsx` | `textPrimary`, `textSecondary`, `backgroundSubtle`, `border` |
| `src/components/PokemonBottomSheet/PokemonBottomSheet.tsx` | `textPrimary`, `textSecondary`, `backgroundSubtle`, `border`, `white` |
| `src/components/PokemonDetail/PokemonDetail.tsx` | `textPrimary`, `textSecondary`, `textTertiary`, `backgroundSubtle`, `border`, `statBar`, `loadingSpinner`, `divider` |
| `src/components/SightingsStats/SightingsStats.tsx` | `textPrimary`, `textSecondary`, `backgroundSubtle`, `border` |
| `src/components/TypeFilter/TypeFilter.tsx` | `textPrimary`, `textSecondary`, `backgroundSubtle`, `border`, `white` |
| `src/screens/FavoritesScreen.tsx` | `textPrimary`, `textSecondary`, `backgroundSubtle` |
| `src/screens/MapScreen.tsx` | `textPrimary`, `textSecondary`, `white` |
| `src/screens/PokemonDetailScreen.tsx` | `textPrimary`, `backgroundSubtle`, `white` |
| `src/screens/PokemonListScreen.tsx` | `textPrimary`, `textSecondary`, `backgroundSubtle` |

### 3.4 — Create `src/constants/storage.ts`

Centralise the AsyncStorage key strings that are currently defined as local constants in two separate hooks:

```typescript
export const STORAGE_KEYS = {
  favoritePokemon: '@favorite_pokemon',
  mapPins:         '@map_pins',
} as const;
```

Update `src/hooks/useFavoritePokemon.ts` (and the new `FavoritePokemonContext.tsx`) to import `STORAGE_KEYS.favoritePokemon` instead of the local `FAVORITE_STORAGE_KEY` string. Update `src/hooks/useMapPins.ts` to import `STORAGE_KEYS.mapPins` instead of the local `MAP_PINS_STORAGE_KEY` string.

---

## Step 4 — Error Handling: Custom `PokeApiError` in `pokeapi.ts`

**Files affected:** `src/services/pokeapi.ts`

### 4.1 — Define `PokeApiError`

Add a custom error class at the top of `pokeapi.ts`:

```typescript
export class PokeApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly endpoint: string,
  ) {
    super(`PokéAPI responded with HTTP ${statusCode} at ${endpoint}`);
    this.name = 'PokeApiError';
  }
}
```

### 4.2 — Update `getPokemonList` and `getPokemonDetail`

Replace:
```typescript
throw new Error(`PokéAPI request failed with status ${response.status} (${url})`);
```
With:
```typescript
throw new PokeApiError(response.status, url);
```

This lets callers (`usePokemonList`, `useMapPins`) narrow the error type with `instanceof PokeApiError` and surface a meaningful message to the user.

## Step 5 — Modern Async Cleanup: Replace `isMountedRef` and `cancelled` flags with `AbortController`

**Files affected:** `src/services/pokeapi.ts`, `src/hooks/usePokemonList.ts`, `src/hooks/usePokemonDetail.ts`, `src/hooks/useMapPins.ts`

### 5.1 — Update `pokeapi.ts` to accept `AbortSignal`

Modify `getPokemonList` and `getPokemonDetail` to accept an optional `signal?: AbortSignal` parameter and pass it to the `fetch` options:

```typescript
export async function getPokemonDetail(id: number, signal?: AbortSignal): Promise<Pokemon> {
  const url = `${BASE_URL}/pokemon/${id}`;
  const response = await fetch(url, { signal });
  // ... rest of the implementation
}

---

## Verification

After all steps, verify with:

```bash
# Type check — must pass with zero errors
npx tsc --noEmit

# Lint — must pass with zero warnings
npm run lint

# Format check
npm run format:check

# Runtime — confirm the app starts, maps load, favorites persist across reloads
npx expo start
```

Manual smoke tests:
1. App launches and loads the Pokémon list.
2. Navigate to a Pokémon detail and set it as favourite — it appears in the Favourites tab immediately.
3. Restart the app (kill + reopen) — favourite persists.
4. Open the Map tab, long-press to drop a pin — a Pokémon marker appears.
5. Android map renders (confirms the env-var API key is wired correctly).
6. iOS map renders (confirms iOS `googleMapsApiKey` is wired correctly).
