# SRC KNOWLEDGE BASE

## OVERVIEW
React Native screens and shared UI live here; styling is token-driven.

## STRUCTURE
```
src/
├── screens/       # Feature screens
├── components/    # Reusable UI (metro/home/ui)
├── services/      # Storage, sound, overlay helpers
├── hooks/         # Shared hooks (timer)
├── theme/         # Tokens + metro theme
└── navigation/    # React Navigation setup
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Screen UI | `src/screens/` | One file per screen |
| Shared UI | `src/components/` | Metro + home + ui components |
| Tokens | `src/theme/tokens.ts` | Canonical design tokens |
| Storage | `src/services/StorageService.ts` | AsyncStorage wrapper |
| Sound | `src/services/SoundService.ts` | Native sound manager |
| Overlay | `src/services/OverlayService.ts` | Android overlay wrapper |

## CONVENTIONS
- Use `Tokens` for spacing/type/colors/radii/elevation (no ad-hoc values).
- Prefer shared services/helpers over direct AsyncStorage or inline timers.
- Web compatibility: guard web-only styles with `Platform.OS === 'web'`.
- Use platform-specific files where needed (e.g., `SoundService.web.ts`).

## ANTI-PATTERNS (THIS DIRECTORY)
- Do not add new hex colors or spacing values outside `Tokens`.
- Do not bypass `StorageService` for persisted state.
- Avoid inline timer duplication; reuse `useTimer` when possible.
