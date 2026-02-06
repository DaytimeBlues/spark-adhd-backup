# Edge Cases (Phase 3)

## Data + parsing
- `null` / `undefined` payloads from storage reads.
- Empty arrays for tasks, brain dumps, timers.
- Corrupted JSON in local storage (invalid JSON string).
- Schema drift: missing fields or extra fields in persisted payloads.
- Partial data: missing `id`, `text`, or `microSteps` on tasks.

## Interaction + UI
- Rapid clicks/taps on timer controls (start/pause/reset).
- Double submits on “Save Task” / “Save Brain Dump”.
- Rapid toggles for Android overlay permissions.
- Scroll + tap race conditions in lists.

## Async + state
- Out-of-order async responses (older storage reads resolving after newer writes).
- Canceled requests (component unmount before async completes).
- Timeouts for mocked API calls.
- Concurrency/race conditions in state updates (simultaneous updates to task lists).

## Platform-specific
- Web-only layout changes at >768px widths.
- Android overlay permission denied vs granted paths.

