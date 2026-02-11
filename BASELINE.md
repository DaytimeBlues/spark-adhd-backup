# Baseline (Phase 0)

## Environment
- Date: 2026-02-06
- Node: >= 18 (per `package.json`)

## Dependency install
```bash
npm install
```
**Result:** ✅ Completed (warning about unknown npm env config `http-proxy`).

## Checks executed

### Lint
```bash
npm run lint
```
**Result:** ❌ Failed
- Error: `TypeError: prettier.resolveConfig.sync is not a function` from `eslint-plugin-prettier` while linting `.eslintrc.js`.

### Unit tests
```bash
npm test
```
**Result:** ❌ Failed
- Failing suite: `__tests__/HomeScreen.test.tsx`
- Error: `TypeError: Cannot read properties of undefined (reading 'xl2')` from `src/screens/HomeScreen.tsx`.
- Note: Primary test focus is Web logic; Native tests are optional.

### Web build
```bash
npm run build:web
```
**Result:** ⚠️ Succeeded with warnings
- Webpack asset size warnings (bundle > 244 KiB recommended limit).

### TypeScript typecheck
```bash
npx tsc --noEmit
```
**Result:** ❌ Failed
- Missing jest types (`describe`, `it`, `beforeEach`, `jest` namespace).
- `src/screens/HomeScreen.tsx`: `Tokens.type.size` does not exist.
- `src/services/GoogleAuthService.ts`: missing `../config/secrets` module.
