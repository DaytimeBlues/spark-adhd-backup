# SRC KNOWLEDGE BASE

## OVERVIEW
React Native screens and shared UI live here; styling is token-driven.

## STRUCTURE


## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Screen UI |  | One file per screen |
| Shared UI |  | Metro + home + ui components |
| Tokens |  | Canonical design tokens |
| Storage |  | AsyncStorage wrapper |
| Sound |  | Native sound manager |
| Overlay |  | Android overlay wrapper |

## CONVENTIONS
- Use  for spacing/type/colors/radii/elevation (no ad-hoc values).
- Prefer shared services/helpers over direct AsyncStorage or inline timers.
- Web compatibility: guard web-only styles with .
- Use platform-specific files where needed (e.g., ).

## ANTI-PATTERNS (THIS DIRECTORY)
- Do not add new hex colors or spacing values outside .
- Do not bypass  for persisted state.
- Avoid inline timer duplication; reuse  when possible.
