# Spark ADHD — Technical Specification

> **Philosophy**: Respect your time as a non-renewable resource. This document separates decision-making from implementation. When you code, you execute—you don't decide.

---

## I. Project Logistics

| Key | Value |
|-----|-------|
| **Repo Name** | `spark-adhd-backup` |
| **Goal** | Speed of delivery (not learning a new stack) |
| **Primary Platforms** | Web/PWA first (Android Chrome priority) |
| **Secondary Platforms** | Native Android bridge (optional, feature-gated) |
| **Deployment** | GitHub Pages (responsive PWA) |

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React Native 0.74.3 + React Native Web |
| **Language** | TypeScript |
| **Navigation** | React Navigation 6 (Stack + Bottom Tabs) |
| **State** | React `useState` / `useContext` (upgrade to Redux Toolkit if complexity grows) |
| **Persistence** | `@react-native-async-storage/async-storage` (local-only) |
| **Bundler (Web)** | Webpack |
| **Testing** | Jest + RTL (unit), Playwright (web E2E), Detox (native E2E) |
| **CI/CD** | GitHub Actions → GitHub Pages |

> Native Android testing and Android Studio workflows are only required when changing native modules (`android/`, overlay bridge/services, or native permissions/build logic).

### Secrets Configuration

**File**: `src/config/secrets.ts` (gitignored)

```typescript
export const SECRETS = {
  GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com',
  GOOGLE_API_KEY: 'AIzaSy...',
};
```

> Copy `secrets.example.ts` → `secrets.ts` and add your keys.

**Required Google API Scopes**:

- `https://www.googleapis.com/auth/tasks`
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/userinfo.email`

---

## II. The Core Utility

### The "One Thing"

> **Assist the adult ADHD user in managing the pitfalls of ADHD.**

This is not a general productivity app. It is a **friction-reducer** and **cognitive offloader** specifically designed for ADHD brains.

### Input → Output

| Input | Output |
|-------|--------|
| User is paralyzed, can't start a task | **Ignite**: 5-minute timer with brown noise. Low commitment = lower barrier. |
| User is overwhelmed by a big project | **Fog Cutter**: Breaks task into micro-steps they can actually do. |
| User needs focus structure | **Pomodoro**: Classic 25/5 technique with visual/audio cues. |
| User is emotionally dysregulated | **Anchor**: Guided breathing (4-7-8, Box, Energize). Immediate calm. |
| User wants to track mood patterns | **Check-In**: Mood + energy tracking with personalized recommendations. |
| User has racing thoughts | **Brain Dump**: Quick capture → clears working memory. |
| User in crisis | **Crisis Mode**: Safety resources, coping strategies, emergency contacts. |
| User needs to offload to Google | **Tasks/Calendar Integration**: Brain Dump → Google Tasks, events → Calendar. |

---

## III. Core Feature Set (MVP)

### ✅ Feature A: Ignite Timer

**Description**: A "just 5 minutes" timer to overcome task initiation paralysis.

**Technical Logic**:

- Timer state: `{ isRunning: boolean; secondsRemaining: number }`
- If timer completes → play completion sound via `SoundService`
- If user exits mid-timer → pause and persist state to `AsyncStorage`
- Brown noise toggle → uses `react-native-sound` or Web Audio API

---

### ✅ Feature B: Fog Cutter

**Description**: Break an overwhelming project into micro-steps.

**Technical Logic**:

- Input: Freeform text (the "big task")
- Output: List of micro-steps (user-generated or AI-suggested in future)
- Persist steps to `AsyncStorage` under `STORAGE_KEYS.tasks`
- Each step has: `{ id: string; text: string; completed: boolean }`

---

### ✅ Feature C: Pomodoro

**Description**: Classic 25-minute work / 5-minute break cycle.

**Technical Logic**:

- State: `{ mode: 'work' | 'break'; secondsRemaining: number; cycleCount: number }`
- Auto-switch between modes on completion
- Notification/sound on mode switch

---

### ✅ Feature D: Anchor Breathing

**Description**: Guided breathing patterns for regulation and focus.

**Technical Logic**:

- Patterns: `4-7-8`, `Box`, `Energize`
- Visual phase loop: inhale/hold/exhale/wait
- Session state managed locally; user can start/stop anytime

---

### ✅ Feature E: Check-In

**Description**: Mood + energy capture with recommendation output.

**Technical Logic**:

- Captures mood/energy scales and optional notes
- Persists entries under `STORAGE_KEYS.checkIns`
- Displays recommendation based on captured state

---

### ✅ Feature F: Brain Dump & AI Sort

**Description**: Quick capture for racing thoughts with optional AI-assisted categorization.

**Technical Logic**:

- **Capture**: Save entries to `AsyncStorage` under `STORAGE_KEYS.brainDump`.
- **AI Sort**: Optional flow via `/api/sort` and `AISortService`.
- **Behavior**: Returns category/priority suggestions (`task`, `event`, `reminder`, `thought`, `worry`, `idea`).
- **Fallback**: If AI is unavailable or key is missing, endpoint returns validated fallback suggestions.
- **Limitations**: Advisory output only; users should review before acting.

---

### ✅ Feature I: Android Overlay (Floating Menu)

**Description**: Persistent floating UI providing an expandable quick-action menu (chat-head style) for rapid task access.

**Architecture**:
- **Native Service (`OverlayService.java`)**: Manages the life cycle of the system window overlay.
- **Native Module (`OverlayModule.java`)**: Bridge between JS and Java to start/stop/update the overlay state and handle expansion.
- **JS Wrapper (`OverlayService.ts`)**: High-level API for React components to interact with the native overlay, including deep-link intent handling.

**Permissions**: Requires `SYSTEM_ALERT_WINDOW` and `FOREGROUND_SERVICE`.

---

### 🚫 Cut Line (Explicitly NOT Building Yet)

| Feature | Reason |
|---------|--------|
| Cloud sync / multi-device | Local-first philosophy; adds complexity |
| Social features / sharing | Out of scope for solo ADHD tool |
| AI-powered micro-step generation | Deferred for now; focus on AI Sorting first |
| Push notifications | Requires native setup; defer to v2 |
| Google Keep integration | Keep API is limited; focus on Tasks first |
| Gamification backend (leaderboards) | Local streak counter is sufficient for MVP |

---

## IV. Database Schema (Local Storage)

Since we're using `AsyncStorage`, this is a key-value store with JSON serialization.

### Storage Keys

```typescript
const STORAGE_KEYS = {
  // User preferences
  theme: 'theme',                  // 'light' | 'dark'

  // Feature data
  tasks: 'tasks',                  // FogCutterTask[]
  brainDump: 'brainDump',          // BrainDumpEntry[]
  checkIns: 'checkIns',            // CheckInEntry[]

  // Timer states (for resume on app reopen)
  igniteState: 'igniteState',      // TimerState
  pomodoroState: 'pomodoroState',  // PomodoroState
};
```

### Type Definitions

```typescript
interface FogCutterTask {
  id: string;
  title: string;        // The "big task"
  steps: MicroStep[];
  createdAt: string;    // ISO timestamp
}

interface MicroStep {
  id: string;
  text: string;
  completed: boolean;
}

interface BrainDumpEntry {
  id: string;
  text: string;
  createdAt: string;
  syncedToTasks: boolean;  // For future Google Tasks sync
}

interface CheckInEntry {
  id: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: string;
}

interface TimerState {
  isRunning: boolean;
  secondsRemaining: number;
  startedAt?: string;
}

interface PomodoroState extends TimerState {
  mode: 'work' | 'break';
  cycleCount: number;
}
```

---

## V. API / Server Actions

### Local Storage API (via `StorageService`)

| Method | Purpose |
|--------|---------|
| `StorageService.get(key)` | Get raw string |
| `StorageService.set(key, value)` | Set raw string |
| `StorageService.getJSON<T>(key)` | Get and parse JSON |
| `StorageService.setJSON<T>(key, value)` | Stringify and set JSON |
| `StorageService.remove(key)` | Delete key |

---

## VI. Component Architecture (Frontend)

### Layouts

| Layout | Purpose |
|--------|---------|
| `WebNavBar` (web) | Top navigation optimized for mobile browser UX |
| Bottom tabs (native) | Primary navigation for native shell only |
| Screen wrapper | Consistent padding, SafeAreaView, token-driven dark theme |

### Page Hierarchy

```
/ (HomeScreen)
├── /ignite (IgniteScreen)
├── /fog-cutter (FogCutterScreen)
├── /pomodoro (PomodoroScreen)
├── /anchor (AnchorScreen)
├── /check-in (CheckInScreen)
├── /brain-dump (BrainDumpScreen)
├── /calendar (CalendarScreen)
└── /crisis (CrisisScreen)
```

### Reusable Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ScaleButton` | `src/components/ui/` | Animated pressable with scale feedback |
| `AppText` | (to create) | Consistent typography variants |
| `Card` | (to create) | Glassmorphic card with 8px grid |
| `TimerDisplay` | (to create) | Shared timer UI for Ignite/Pomodoro |

### Design Tokens

Canonical source:
- `src/theme/tokens.ts`
- `docs/DESIGN_RULES.md`

Rules:
- No hardcoded hex values in UI code when token exists.
- No ad-hoc spacing/typography/radii values.
- Web + Android Chrome behavior is the primary visual target.
- Token examples in this file are informational only; `tokens.ts` is authoritative.

---

## VII. Deployment & CI/CD

### Build Commands

```bash
# Development
npm run web          # Webpack dev server

# Production Build
npm run build:web    # Outputs to /dist

# Testing
npm test             # Jest unit tests
npm run e2e          # Playwright E2E (web)
```

### GitHub Pages Deployment

1. **Build**: `npm run build:web` → outputs to `dist/`
2. **Deploy**: GitHub Actions workflow pushes `dist/` to `gh-pages` branch
3. **URL**: `https://DaytimeBlues.github.io/spark-adhd-backup`

### Recommended GitHub Action

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:web
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Verification Checklist

- [ ] `npm run build:web` completes without errors
- [ ] `dist/index.html` loads locally
- [ ] Responsive: Works on mobile viewport (375px) and desktop (1440px)
- [ ] All screens navigate correctly
- [ ] AsyncStorage persists data across refreshes (via localStorage polyfill on web)

---

## VIII. Future / Icebox

> Park these ideas here to clear your mind. They are **not** in scope for the current sprint.

| Idea | Notes |
|------|-------|
| AI micro-step generator | Use Gemini API to auto-break tasks |
| Voice input for Brain Dump | Speech-to-text capture |
| Widget / Quick Actions | Android home screen widget |
| Apple Watch companion | Breathing exercises on wrist |
| Offline-first sync | CRDTs for eventual consistency |
| Habit streaks visualization | Calendar heatmap |
| Export data to JSON | User data portability |
| Dark/Light theme toggle | Already have `theme` storage key |
| Notification reminders | "Time for a Check-In" push |

---

## IX. Open Questions

1. **Google Keep API**: Keep doesn't have a public API. Alternatives:
   - Use Tasks (recommended)
   - Use Google Drive API to create Google Docs as "notes"

2. **OAuth on Web**: `@react-native-google-signin` is native-only. For web:
   - Use `@react-oauth/google` or raw GAPI
   - Consider platform-specific auth service

3. **Streak Feature**: Deferred to future version.

## X. Security & Compliance

The project follows OWASP 2025 standards for web and mobile security.

- **Security Checklist**: See [docs/SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) for current controls.
- **Secret Scanning**: `gitleaks` is configured for local/CI scanning workflows.
- **Credential Safety**: No secrets should be committed to the repository. Use `src/config/secrets.ts` (ignored) or environment variables.

---

*Last updated: 2026-02-11*
