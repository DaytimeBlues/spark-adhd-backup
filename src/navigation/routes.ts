/**
 * Typed Navigation Routes
 *
 * Centralized route constants to eliminate stringly-typed navigation.
 */

export const ROUTES = {
  // Root Stack
  MAIN: 'Main' as const,

  // Tab Navigator
  HOME: 'Home' as const,
  FOCUS: 'Focus' as const,
  TASKS: 'Tasks' as const,
  CALENDAR: 'Calendar' as const,

  // Home Stack
  HOME_MAIN: 'HomeMain' as const,
  CHECK_IN: 'CheckIn' as const,
  CBT_GUIDE: 'CBTGuide' as const,

  // Modal Screens (Root Stack)
  FOG_CUTTER: 'FogCutter' as const,
  POMODORO: 'Pomodoro' as const,
  ANCHOR: 'Anchor' as const,
} as const;

export type RouteNames = (typeof ROUTES)[keyof typeof ROUTES];
