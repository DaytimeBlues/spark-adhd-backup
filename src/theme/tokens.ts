// Design tokens for Spark ADHD.
// Web-first, must also work on Android web.

import { LinearColors, LinearSpacing, LinearTypography, LinearRadii, LinearElevation } from './linearTokens';
import { Motion } from './motion';

export const Colors = LinearColors;
export const Spacing = LinearSpacing;
export const TypeScale = LinearTypography.size;
export const Radii = LinearRadii;
export const Elevation = LinearElevation;

export const Layout = {
  maxWidth: {
    prose: 680,
    content: 960,
  },
  minTapTarget: 44,
  minTapTargetComfortable: 48,
} as const;

export const Tokens = {
  colors: Colors,
  spacing: Spacing,
  type: TypeScale,
  radii: Radii,
  elevation: Elevation,
  layout: Layout,
  motion: Motion,
} as const;

export type TokensType = typeof Tokens;

