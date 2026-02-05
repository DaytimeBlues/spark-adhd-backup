# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-05
**Commit:** 0534d0c
**Branch:** master

## OVERVIEW
React Native 0.74 + TypeScript app with React Native Web (webpack) and Android native module support.

## STRUCTURE
```
spark-adhd-backup/
├── android/         # Android native project
├── src/             # App screens, components, services, theme
├── __tests__/       # Jest unit/component tests + Detox tests
├── e2e/             # Playwright web tests
├── docs/            # Design rules + PRD
├── App.tsx          # Root App component (shared native/web)
├── index.js         # Native entry
└── index.web.js     # Web entry (webpack)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Home UI | `src/screens/HomeScreen.tsx` | Mode cards + streak + overlay toggle |
| Navigation | `src/navigation/AppNavigator.tsx` | Stack + bottom tabs |
| Services | `src/services/` | Storage, Sound, Overlay wrappers |
| Theme tokens | `src/theme/tokens.ts` | Canonical styling tokens |
| Web build | `webpack.config.js` | Entry `index.web.js` |
| Android build | `android/app/build.gradle` | SDK, signing, deps |
| E2E web tests | `e2e/` | Playwright spec files |
| Unit tests | `__tests__/` | Jest + React Native Testing Library |

## CODE MAP
LSP unavailable in this environment.

## CONVENTIONS
- TypeScript strict mode; path alias `@/*` -> `src/*` via `tsconfig.json`.
- UI styling must use `Tokens` values (`src/theme/tokens.ts`).
- Jest tests live under `__tests__/` (testMatch enforces this).
- Web entry uses `index.web.js` + webpack; native entry uses `index.js`.

## ANTI-PATTERNS (THIS PROJECT)
- No ad-hoc spacing/typography/colors; use `Tokens` only.
- No magic numbers in UI styles; use tokens or named constants.
- Do not comment out old code; delete dead code.
- Use pointer events; do not rely on legacy touch events.

## UNIQUE STYLES
- Material 3 + glassmorphism aesthetic; 8pt grid.
- Touch targets >= 44px (prefer 48px on touch-heavy surfaces).
- Web responsive grid expands beyond 768px widths.

## COMMANDS
```bash
npm run android
npm run web
npm test
npm run e2e
npm run lint
npm run build:release
```

## NOTES
- Android overlay uses SYSTEM_ALERT_WINDOW and foreground service permissions.
- Release signing uses env vars in `android/app/build.gradle`.
- Playwright tests rely on stable `testID` selectors in RN web.
- Design rules are detailed in `docs/DESIGN_RULES.md`.
