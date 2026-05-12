# CLAUDE.md

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native 0.76+ via **Expo SDK 52** |
| Language | **TypeScript** (strict mode) |
| Navigation | **React Navigation v7** — `@react-navigation/bottom-tabs` + `@react-navigation/native-stack` |
| Async Storage | `@react-native-async-storage/async-storage` |
| Camera | `react-native-vision-camera` v4 |
| Maps | `react-native-maps` |
| Bottom Sheet | `@gorhom/bottom-sheet` v5 |
| Location | `expo-location` |
| Media | `expo-media-library` |
| Data Source | [PokéAPI](https://pokeapi.co) — REST, no auth required |
| Linting | **ESLint** with `@typescript-eslint` + `eslint-plugin-react-native` |
| Formatting | **Prettier** |
| Package Manager | `npm` |

---

## Build & Run Commands

```bash
# Start Expo dev server (scan QR with Expo Go app)
npx expo start

# Start targeting a specific platform
npx expo start --ios
npx expo start --android

# Lint the codebase
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format all files with Prettier
npm run format

# Check formatting without writing
npm run format:check

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type-check without emitting
npx tsc --noEmit
```

---

## Coding Conventions

### General
- All files use **TypeScript** — no `.js` files in `src/`
- Prefer **functional components** with hooks; no class components
- One component per file; file name matches the component name
- Use **named exports** for components, screens, hooks, and utilities
- Use **default export** only for the root `App.tsx`

### Naming
| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `PokemonCard.tsx` |
| Screens | PascalCase + `Screen` suffix | `PokemonDetailScreen.tsx` |
| Hooks | camelCase + `use` prefix | `useFavoritePokemon.ts` |
| Utilities / services | camelCase | `pokeapi.ts` |
| Types / interfaces | PascalCase | `type PokemonSummary = ...` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_POKEMON_LIMIT` |
| Navigation param types | PascalCase + `ParamList` suffix | `ListStackParamList` |

### TypeScript
- Enable `strict: true` in `tsconfig.json`
- No `any` — use `unknown` and narrow, or define a proper type
- All navigation screens must use typed props via `NativeStackScreenProps` / `BottomTabScreenProps`
- All param lists defined in `src/navigation/types.ts`

### Styles
- Use `StyleSheet.create()` — no inline style objects in JSX
- Keep styles at the bottom of the file, after the component
- No magic numbers — extract spacing/sizes into a `theme.ts` or constants

### Hooks
- Business logic lives in custom hooks, not directly in screen components
- Hooks that touch AsyncStorage must handle loading and error states explicitly

### API calls
- All PokéAPI calls go through `src/services/pokeapi.ts` — no raw `fetch` calls in components
- Use `async/await` with try/catch; no `.then()` chains

---

## Architecture & File Paths

```
├── App.tsx                          # Entry point — NavigationContainer + GestureHandlerRootView
├── CLAUDE.md
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
│
└── src/
    ├── navigation/
    │   ├── AppNavigator.tsx         # Bottom tab navigator (root)
    │   ├── ListStack.tsx            # Stack navigator for List tab
    │   └── types.ts                 # All ParamList types for every navigator
    │
    ├── screens/
    │   ├── FavoritesScreen.tsx
    │   ├── PokemonListScreen.tsx
    │   ├── PokemonDetailScreen.tsx
    │   ├── CameraScreen.tsx
    │   └── MapScreen.tsx
    │
    ├── components/
    │   ├── PokemonCard/
    │   │   ├── PokemonCard.tsx
    │   │   └── index.ts
    │   ├── PokemonBottomSheet/
    │   │   ├── PokemonBottomSheet.tsx
    │   │   └── index.ts
    │   └── EmptyState/
    │       ├── EmptyState.tsx
    │       └── index.ts
    │
    ├── hooks/
    │   ├── useFavoritePokemon.ts    # AsyncStorage read/write for favorite
    │   ├── usePokemonList.ts        # Paginated list fetching
    │   └── usePokemonDetail.ts      # Single Pokémon fetch by id
    │
    ├── services/
    │   └── pokeapi.ts               # All PokéAPI fetch functions
    │
    ├── types/
    │   └── pokemon.ts               # Shared domain types (Pokemon, PokemonSummary, etc.)
    │
    └── constants/
        └── theme.ts                 # Colors, spacing, font sizes
```

### Key rules
- **Screens** only orchestrate — they import hooks and components; they do not contain business logic directly
- **Components** are pure and reusable — they receive props and emit callbacks; they do not call services
- **Hooks** own all side effects (API calls, storage, permissions)
- **Services** are pure async functions — no React imports allowed in `src/services/`
- `PokemonBottomSheet` is shared between the List tab and the Map tab — do not duplicate it
