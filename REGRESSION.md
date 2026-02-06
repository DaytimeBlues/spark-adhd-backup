# Regression Protection (Phase 4)

## Regression suite
- Script: `scripts/regression.sh`
- NPM entrypoint: `npm run test:regression`

This script runs the critical tests plus coverage enforcement for core logic.

## Bug-to-test rule
- Every bugfix **must** include a regression test that fails before the fix and passes after.
- Regression tests should live in `__tests__/` and be added to the regression script if they cover critical paths.

