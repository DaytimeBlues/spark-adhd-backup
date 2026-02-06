# Consolidation Plan (Phase 2)

## Single Source of Truth decisions

### Schemas
- **Canonical location:** `src/services/storageSchemas.ts` (proposed).
- **Policy:** All persisted shapes (tasks, brain dump items, timer state) will be defined + validated here.
- **Consumers:** Screens call a shared validator/normalizer before writing or reading from storage.

### API client(s)
- **Canonical client:** `src/services/ApiClient.ts` (proposed).
- **Policy:** One fetch wrapper handles retries, timeouts, and error normalization; no direct `fetch` in screens.

### State ownership
- **Canonical state per feature:** feature hooks in `src/hooks/` (e.g., `useTimer`) with screens as thin renderers.
- **Policy:** Avoid mirrored state between screen local state and storage by centralizing persistence in hooks or service functions.

## Delete list
- ✅ `src/services/GoogleAuthService.ts` (removed; unused, referenced missing secrets).
- ❌ Any new API service duplicates (do not add until `ApiClient` exists).

## Execution order (small, safe merges)
- [x] **Step 1:** Remove unused `GoogleAuthService` and stale doc references.
- [x] **Step 2:** Route storage access through `StorageService` in `HomeScreen`.
- [x] **Step 3:** Fix token usage mismatch in `HomeScreen` styles.
- [ ] **Step 4:** Introduce `storageSchemas.ts` and migrate `FogCutter` + `BrainDump` persisted shapes.
- [ ] **Step 5:** Consolidate timers behind `useTimer` and delete per-screen interval logic.
- [ ] **Step 6:** Introduce a central route map to remove stringly-typed navigation in `HomeScreen`.

