# TESTS KNOWLEDGE BASE

## OVERVIEW
Jest unit/component tests live here; Detox e2e tests are under `__tests__/detox`.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Jest config | `jest.config.js` | testMatch restricts to __tests__ |
| Global setup | `__tests__/setup.ts` | testing-library matchers |
| Unit tests | `__tests__/*.test.ts(x)` | Hook and component tests |
| Detox tests | `__tests__/detox/` | Native e2e specs |

## CONVENTIONS
- Jest only discovers tests under `__tests__/`.
- Detox tests are excluded from Jest (run via `npm run test:e2e:android`).
- Prefer @testing-library/react-native patterns for component tests.

## ANTI-PATTERNS (THIS DIRECTORY)
- Do not place Jest tests outside `__tests__/`.
- Do not run Detox specs through Jest.
- Avoid real AsyncStorage; use mocks as in existing tests.
