# Product Requirements Document (PRD): Spark ADHD

## 1. Problem Statement

Individuals with ADHD frequently experience executive dysfunction, manifesting as difficulty with task initiation ("ADHD paralysis"), task switching, emotional regulation, and overwhelming cognitive load. Traditional productivity tools often fail because they lack the necessary "friction-reducing" mechanisms or sensory support required for neurodivergent brains.

**Spark ADHD** aims to provide a centralized hub for focus, grounding, and cognitive offloading, specifically designed to bypass common ADHD roadblocks.

## 2. User Personas

### 2.1 The Overwhelmed Professional

- **Attributes**: Highly capable but struggles with "big" projects.
- **Pain Point**: Finds it impossible to start a complex task (e.g., writing a report) because the steps aren't clear.
- **Need**: A tool to "cut through the fog" and break tasks into micro-steps.

### 2.2 The Distressed Student

- **Attributes**: Prone to emotional overwhelm or "shutdown" during high-stress periods.
- **Pain Point**: Forgets coping mechanisms when in a state of high anxiety.
- **Need**: Immediate, tactile grounding exercises (Anchor) and mood tracking (Check In).

## 3. User Stories

| ID | Persona | User Story | Benefit |
|----|---------|------------|---------|
| US.1 | Professional | As a user, I want a "5-minute Ignite" timer | To overcome the hurdle of task initiation without the commitment of a full hour. |
| US.2 | Professional | As a user, I want to use a "Fog Cutter" to break down a project | To reduce the cognitive load of complex projects into manageable steps. |
| US.3 | Student | As a user, I want a one-tap "Anchor" breathing exercise | To quickly regulate my nervous system during emotional spikes. |
| US.4 | All | As a user, I want to "Brain Dump" any thought and have AI suggest categories | To clear my working memory and reduce the friction of manual organization. |
| US.5 | All | As a user, I want to track my "Streak" | To use gamified dopamine feedback to build consistency. |

## 4. Technical Architecture

### 4.1 Frontend Stack

- **Framework**: React Native (v0.74.3)
- **Primary Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Icons**: Material Community Icons

### 4.2 State & Persistence

- **Storage**: `@react-native-async-storage/async-storage` for local persistence (streaks, check-ins, tasks, brain dump).
- **Architecture**: React state/hooks (`useState`, `useEffect`, focused service wrappers). Centralized store can be introduced later if complexity increases.

### 4.3 Testing

- **Unit/Integration**: Jest + React Testing Library.
- **E2E**: Detox for automated UI testing on Android.
- **CI/CD**: GitHub Actions (Android build and test automation).

## 5. Design Philosophy (UX)

Applying Lidwell’s *Universal Principles of Design* and Norman’s *Design of Everyday Things*:

- **Signifiers**: Use clear, vibrant icons and colored cards (e.g., Red for Crisis, Turquoise for Fog Cutter) to signal the "mode" and purpose of each tool without requiring the user to read long labels.
- **Affordances**: Buttons and Cards are highly tactile with `activeOpacity` feedback, "inviting" interaction through their physical appearance in the grid.
- **Hierarchy**: The "Streak" is placed at the top-left (starting point of eye-tracking) to provide immediate positive reinforcement upon app launch.
- **Cognitive Load**: Each tool (Ignite, Fog Cutter, etc.) is isolated in its own screen to ensure single-task focus.

## 6. Success Metrics (KPIs)

1. **Retention (D30)**: Percentage of users maintaining a streak beyond 30 days.
2. **Session Diversity**: Number of different tools (modes) used per session (target: >2).
3. **Usage Frequency**: Target of 3 check-ins/focus sessions per day.

## 7. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| App Overwhelm | High | Keep the home screen grid simple; avoid adding "settings" or "options" deep in focus modes. |
| Data Loss | Medium | Use robust AsyncStorage persistence and backup/export workflow so streaks and entries are not lost on updates. |
| Notification Fatigue | Medium | Ensure "Ignite" and "Pomodoro" notifications are meaningful and not annoying (haptic feedback preferred). |
