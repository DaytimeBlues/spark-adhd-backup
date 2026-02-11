# Security Checklist (OWASP 2025)

This checklist is for Spark ADHD (React Native + Vercel API) before sharing publicly.

## Baseline Standards

- OWASP Top 10:2025 (web)
- OWASP API Security Top 10:2023
- OWASP MASVS/MASTG (mobile)

## App + API Controls

- [ ] Enforce strict input validation on all API routes.
- [ ] Apply per-client rate limiting to expensive AI endpoints.
- [ ] Use least-privilege OAuth scopes for Google integrations.
- [ ] Avoid storing tokens/secrets in AsyncStorage; use platform secure storage.
- [ ] Keep API keys in Vercel environment variables only.
- [ ] Return safe error messages without stack traces.
- [ ] Confirm ownership checks on all user-scoped resources.
- [ ] Add request/response size limits to AI endpoints.

## Mobile (React Native)

- [ ] Verify Android overlay permission flow before enabling overlay.
- [ ] Keep debug logs disabled in production builds.
- [ ] Avoid embedding long-lived secrets in app binary.
- [ ] Gate voice recording by runtime permission checks.

## Secret Scanning

- [ ] Run gitleaks in working tree: `gitleaks dir .`
- [ ] Run gitleaks in history: `gitleaks git .`
- [ ] Review new findings before every push.
- [ ] Rotate any real secret ever committed to git history.

## Release Readiness

- [ ] Run tests and verify no regressions.
- [ ] Validate API behavior for malformed requests.
- [ ] Confirm no sensitive personal data in logs.
- [ ] Re-run secret scan before tagging release.
