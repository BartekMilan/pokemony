  Must Fix

  These are either user-visible bugs or hard architectural violations.

  #: 1
  What: Add Pokémon name to PokemonDetail
  Why it matters: Visible bug: name is missing in Favorites and the map bottom sheet, where there is no navigator header to
    compensate
  ────────────────────────────────────────
  #: 2
  What: Move getPokemonDetail call out of MapScreen
  Why it matters: Direct service call in a screen — the one rule the rest of the codebase follows perfectly; creates an
    untestable, feedback-less fetch path
  ────────────────────────────────────────
  #: 3
  What: Replace pinsRef with functional setPins update
  Why it matters: Dual source of truth for the same list; any path that updates state without also updating the ref silently
    corrupts the next addPin
  ────────────────────────────────────────
  #: 4
  What: Surface addPin failures to the user
  Why it matters: Long-press on map → spinner disappears → nothing happens; user has no idea it failed

  ---
  Should Fix

  These are correctness/quality issues that won't bite immediately but will as the codebase grows.

  #: 5
  What: Hoist StoredPin type out of useEffect
  Why it matters: Type defined inside a callback is invisible to tests and the rest of the module
  ────────────────────────────────────────
  #: 6
  What: Remove setIsLoading(false) from refresh
  Why it matters: Dead code that confuses the state machine — isLoading was never set true in refresh
  ────────────────────────────────────────
  #: 7
  What: Pass handlePinPress by reference to PokemonMarker
  Why it matters: Inline arrow defeats memo on every render, which is expensive on a map
  ────────────────────────────────────────
  #: 8
  What: Move SPRITE_BASE_URL to constants/api.ts
  Why it matters: Same URL is already partially duplicated as FALLBACK_SPRITE; one source of truth
