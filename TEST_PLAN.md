# QA Test Plan: PWA & React Native

This plan ensures the app is stable across its primary Web/PWA interface and its optional Native Android bridge.

## 1. Primary: Web/PWA Testing (Mandatory)

Since the app is used primarily as a PWA, these tests are the highest priority.

### Automation (Playwright)

- **Launch**: Verify the app loads at the root URL.
- **Mobile Emulation**: Tests must run against Chrome/Safari in "Mobile" mode to ensure responsive UI.
- **Micro-Steps**: Verify "Fog Cutter" can add and transition through tasks.
- **Persistence**: Verify data remains after a page refresh (LocalStorage/AsyncStorage).

### Manual QA

- [ ] **Home Screen**: Verify "Install App" prompt appears on mobile browsers.
- [ ] **Offline Mode**: Verify the app loads without a network connection (Service Worker check).
- [ ] **Timer Stability**: Ensure the Pomodoro timer continues when the tab is hidden (Background tab behavior).

---

## 2. Optional: Native Android Testing (Future Option)

These tests only need to be run if modifying native modules or the Android shell.

### Automation (Espresso/Detox)

- **Floating Bubble**: Verify the overlay appears and reflects the correct task count.
- **Lifecycle**: Verify the app recovers from a "force stop" or system memory pressure.

### Dependency Matrix (Native)

| Area | Dependency | Version | Notes |
| --- | --- | --- | --- |
| React Native | com.facebook.react:react-android | 0.74.x | AndroidX-based.
| Google Auth | com.google.android.gms:play-services-auth | 21.2.0 | Required for native sign-in.

---

## Required Tasks

1. `npm run e2e` - Primary quality gate before web deployment.
2. `npm test` - Run for logic/state changes and before release branches.
3. `./gradlew connectedDebugAndroidTest` - Optional; run only when changing native Android code.

### Current Default Workflow

- Day-to-day feature/UI work targets web/PWA first.
- Android Studio and native integration testing are deferred unless native code changed.
