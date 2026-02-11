# System Map: PWA-First Architecture

This project is a **PWA-First** cross-platform application. Most logic and UI is shared, but the primary entry point and deployment target is the Web.

## 1. Primary Entry Point: Web/PWA

- **Entry**: `index.web.js`
- **Config**: `webpack.config.js`
- **Deployment**: Github Pages (`https://DaytimeBlues.github.io/spark-adhd-backup`)

## 2. Optional Entry Point: Native Android (Future)

- **Entry**: `index.js`
- **Project Folder**: `/android`
- **Special Features**: `OverlayService.ts` (Used only by native shell for floating bubble).

## 3. Core Logic (Cross-Platform)

- `src/services/StorageService.ts`: Uses `AsyncStorage` which works in both Chrome (PWA) and Android (Native).
- `src/hooks/useTimer.ts`: Central engine for all screens.
- `src/screens/`: 12 screens that render perfectly in any mobile browser.

## 4. Testing Hierarchy

1. **Jest**: Local logic tests.
2. **Playwright**: Browser-based E2E (Mobile emulation).
3. **Detox/Espresso**: (Optional) Native-only UI testing.
