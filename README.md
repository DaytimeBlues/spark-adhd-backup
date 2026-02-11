# Spark ADHD - PWA & React Native

A behavioral activation tool for ADHD, designed as a high-performance **PWA (Progressive Web App)** with an optional React Native mobile bridge.

> [!IMPORTANT]
> **Primary Workflow**: Most developers should use the **Web/PWA** version. It provides the full app experience through any mobile browser and can be "Installed" as a standalone app on your home screen.

## Deployment Status

- **Live PWA**: [https://DaytimeBlues.github.io/spark-adhd-backup](https://DaytimeBlues.github.io/spark-adhd-backup)

## Features

- **Ignite** - 5-minute focus timer with brown noise
- **Fog Cutter** - Break overwhelming tasks into micro-steps
- **Pomodoro** - Classic Pomodoro technique (25/5)
- **Anchor** - Breathing exercises (4-7-8, Box, Energize)
- **Check In** - Mood and energy tracking with recommendations
- **Brain Dump** - Quick capture for racing thoughts with AI-powered sorting suggestions
- **Security** - Built-in security checklist and secret scanning (gitleaks) support
- **Calendar** - Simple monthly view
- **Crisis Mode** - Safety resources and coping strategies

## Getting Started (Web/PWA)

This is the recommended way to run and test the app.

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run web
```

The app will be available at `http://localhost:3000`.

### Running Tests

```bash
# Verify JavaScript "Brain" logic
npm test

# E2E Browser Testing (Mobile emulation)
npm run e2e
```

### Deploying

```bash
npm run deploy  # Pushes to GitHub Pages
```

---

## 🚀 Advanced: Native Android (Future Option)

The native Android shell is a secondary wrapper used for platform-specific features like system-wide overlays. **Android Studio is NOT required for general feature development.**

### Extras in Native Mode

- **Floating Menu (Android)** - An expandable quick-action chat-head style menu that floats over other apps for rapid access to core features.

### Native Setup (If needed)

1. Install JDK 17 and Android Studio.
2. `npm install`
3. `cd android && ./gradlew clean`
4. `npm run android`

### Native Tests

```bash
# UI Tests (Requires Emulator)
npm run test:e2e:android
```

## Tech Stack

- **Framework**: React Native Web (allows single codebase for PWA + Native)
- **Logic**: TypeScript
- **State/Storage**: AsyncStorage
- **Testing**: Jest + Playwright (E2E)
- **Deployment**: GitHub Pages

## License

MIT
