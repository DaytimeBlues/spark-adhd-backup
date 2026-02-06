# Audit (Phase 1)

## Highest-impact integrity risks

1. **Storage access bypassing `StorageService`**
   - **Locations:** `src/screens/HomeScreen.tsx` (historically used `AsyncStorage` directly).
   - **Risk:** Inconsistent error handling and key usage; makes it easy to diverge from canonical storage behavior and key names.
   - **Minimal fix:** Use `StorageService.get` + `StorageService.STORAGE_KEYS` (implemented in Phase 2).

2. **Token usage mismatch leading to runtime failures**
   - **Locations:** `src/screens/HomeScreen.tsx` (`Tokens.type.size.xl2`), `src/theme/tokens.ts` (exports `Tokens.type` without `size`).
   - **Risk:** Runtime crash in screen rendering and failing tests.
   - **Minimal fix:** Use the canonical token value (`Tokens.type.h1` / `Tokens.type['2xl']`). Implemented in Phase 2.

3. **Duplicated timer logic across screens**
   - **Locations:** `src/screens/AnchorScreen.tsx`, `src/screens/IgniteScreen.tsx`, `src/screens/PomodoroScreen.tsx`, `src/hooks/useTimer.ts`.
   - **Risk:** Divergent timer behavior, inconsistent pause/reset semantics, and higher bug surface for race conditions.
   - **Minimal fix:** Consolidate timers behind `useTimer` with shared settings; remove in-screen interval duplication.

4. **Schema drift for persisted state**
   - **Locations:** `src/screens/FogCutterScreen.tsx`, `src/screens/BrainDumpScreen.tsx`, `src/screens/IgniteScreen.tsx`, `src/screens/PomodoroScreen.tsx`.
   - **Risk:** Each screen defines its own shape and normalization logic; storage payloads can drift or partially corrupt without a canonical schema.
   - **Minimal fix:** Introduce shared storage schemas/types and central validators in `src/services`.

5. **Implicit coupling in navigation logic**
   - **Locations:** `src/screens/HomeScreen.tsx` (manual string matching for navigation IDs).
   - **Risk:** Hard-coded route strings become stale when navigation changes; no compiler safety.
   - **Minimal fix:** Use a typed route map or central route constants.

6. **Style tokens not consistently enforced**
   - **Locations:** `src/screens/FogCutterScreen.tsx` (hard-coded font sizes), `src/screens/*` (scattered literal values).
   - **Risk:** Visual drift and inconsistent accessibility sizing.
   - **Minimal fix:** Replace literal sizes with `Tokens` values; codify lint rules to prevent ad-hoc values.

7. **Unused API service surface**
   - **Locations:** `src/services/GoogleAuthService.ts` (removed).
   - **Risk:** Unused code referencing missing secrets/credentials causes typecheck failures and increases maintenance burden.
   - **Minimal fix:** Remove unused service and any docs pointing to it (implemented in Phase 2).

## Duplication table

| Duplicate A | Duplicate B | Recommendation |
| --- | --- | --- |
| `setInterval` timers in `AnchorScreen`, `IgniteScreen`, `PomodoroScreen` | `useTimer` hook | Migrate screens to use `useTimer` and delete per-screen interval logic. |
| Inline storage normalization in `FogCutterScreen` | Similar normalization in `BrainDumpScreen` | Centralize storage schemas + validation helpers in `src/services`. |
| Hard-coded font sizes in screens | `Tokens.type.*` | Replace literals with `Tokens` type scale. |
| Route string branching in `HomeScreen` | `AppNavigator` route definitions | Introduce centralized route constants (single source). |
