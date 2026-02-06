#!/usr/bin/env bash
set -euo pipefail

echo "Running regression suite (critical tests + coverage thresholds)..."

npx jest \
  --runTestsByPath \
  __tests__/helpers.test.ts \
  __tests__/helpers.fuzz.test.ts \
  __tests__/StorageService.test.ts \
  __tests__/useTimer.test.ts \
  __tests__/FogCutterScreen.test.tsx \
  __tests__/HomeScreen.test.tsx \
  __tests__/CBTGuideScreen.test.tsx

npx jest \
  --coverage \
  --runTestsByPath \
  __tests__/helpers.test.ts \
  __tests__/helpers.fuzz.test.ts \
  __tests__/StorageService.test.ts \
  __tests__/useTimer.test.ts
