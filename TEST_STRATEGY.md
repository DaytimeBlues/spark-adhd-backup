# Test Strategy: Logic & Web-First

Our goal is to ensure the "Brain" of the app is unbreakable, regardless of whether it's running in a browser or a native app.

## Core Logic (Priority 1)

We enforce ≥90% coverage on non-UI logic to prevent regressions in user data.

- `src/utils/helpers.ts`: Time formatting and streak calculations.
- `src/services/StorageService.ts`: Data persistence logic.
- `src/hooks/useTimer.ts`: The central engine for all timers.

## Integration Path (Priority 2)

Focus on the **Web Runtime** using Playwright.

- Ensure the app scales correctly to various screen sizes.
- Verify that state transitions (e.g., Timer -> Break) work across all platforms (Web is primary target).
- Manual smoke tests on Android Chrome for touch responsiveness.

## Native Edge Cases (Priority 3 / Future)

Native-only features like the **Floating Overlay** are tested in isolation. These are not required for standard feature parity in the PWA.

## Summary of Commands

- `npm run test:coverage`: Full logic verification.
- `npm run e2e`: Full browser integration verification.
- `npm run test:regression`: Critical path verification (logic + basic UI).
