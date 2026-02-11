import { Platform } from 'react-native';

export const Motion = {
  durations: {
    fast: 150,
    base: 250,
    slow: 350,
  },
  easings: {
    default: 'ease',
    out: 'ease-out',
    in: 'ease-in',
    inOut: 'ease-in-out',
  },
  // Web-specific transition strings
  transitions: {
    fast: Platform.select({ web: 'all 0.15s ease', default: undefined }),
    base: Platform.select({ web: 'all 0.25s ease', default: undefined }),
    slow: Platform.select({ web: 'all 0.35s ease', default: undefined }),
    transform: Platform.select({ web: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)', default: undefined }),
  },
  // Interactive scales
  scales: {
    press: 0.96,
    hover: 1.02,
  },
} as const;
