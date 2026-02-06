# Test Strategy (Phase 3)

## Goals
- Prioritize **failure-first** coverage (error paths, invalid data, async races).
- Lock down **core logic** to ≥90% coverage with enforced thresholds.
- Provide a repeatable regression suite for CI.

## Core logic definition (coverage >= 90%)
- `src/utils/helpers.ts`
- `src/services/StorageService.ts`
- `src/hooks/useTimer.ts`

Coverage thresholds are enforced via `jest.config.js` (per-file thresholds).

## Unit tests
- Helpers: `formatTime`, `calculateStreak`.
- Storage: `StorageService` success + failure behavior, invalid JSON handling.
- Timer hook: `useTimer` start/pause/reset/onComplete behavior.

## Integration tests
- `FogCutterScreen` loading tasks from storage and rendering list content.
- `HomeScreen` rendering (ensures no token/runtime regression).

## Mocking strategy
- Async storage mocked via `@react-native-async-storage/async-storage` mocks.
- Feature services (`StorageService`) mocked per-screen to isolate render behavior.

## Fuzz testing
- Lightweight fuzz test for `formatTime` using randomized input values (no new dependencies).

## Coverage reporting
- `npm run test:coverage` for the full repo.
- `npm run test:regression` for the critical test set + enforced thresholds.

