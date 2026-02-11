# Release Process and Rollback Strategy

## Release Workflow

### Pre-Release Checklist

**Code Quality:**
- [ ] All tests passing (`npm test`, `npm run e2e`)
- [ ] Lint clean (`npm run lint`)
- [ ] No console errors in development build
- [ ] TypeScript compilation successful (`tsc --noEmit`)

**Functional Validation:**
- [ ] Core user flows tested manually (web + Android if applicable)
- [ ] No regressions in existing features
- [ ] New features documented in `CHANGELOG.md`

**Dependency Audit:**
- [ ] Run `npm audit` and address critical vulnerabilities
- [ ] Verify no deprecated dependencies blocking build

---

## Web/PWA Release (Primary)

### GitHub Pages Deployment

**Automated via GitHub Actions:**

1. **Merge to master branch:**
   ```bash
   git checkout master
   git merge feature-branch
   git push origin master
   ```

2. **GitHub Actions workflow triggers:**
   - Runs `npm run build:web`
   - Deploys to `gh-pages` branch
   - Available at `https://<username>.github.io/spark-adhd-backup/`

3. **Manual deployment (if Actions disabled):**
   ```bash
   npm run build:web
   npm run deploy  # Pushes dist/ to gh-pages branch
   ```

**Validation:**
- Open deployed URL in browser
- Test core features (Ignite, Fog Cutter, etc.)
- Check browser console for errors
- Verify service worker updates (if PWA)

**Rollback:**
```bash
# Revert gh-pages branch to previous commit
git checkout gh-pages
git log  # Find last good commit hash
git reset --hard <commit-hash>
git push --force origin gh-pages
```

---

## Android Native Release (Secondary)

### Prerequisites
- JDK 17 installed and `JAVA_HOME` set (see `docs/ANDROID_BUILD_BLOCKERS.md`)
- Keystore file present at `android/app/release.keystore`
- Environment variables set:
  ```bash
  export KEYSTORE_PASSWORD=<your-password>
  export KEY_ALIAS=<your-alias>
  export KEY_PASSWORD=<your-key-password>
  ```

### Build Release APK

```bash
cd android
./gradlew :app:assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Build Release AAB (Google Play)

```bash
cd android
./gradlew :app:bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Version Bumping

**Before building:**

1. Update `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.1.0"  // Follow semver
   ```

2. Update `package.json`:
   ```json
   "version": "1.1.0"
   ```

3. Tag release:
   ```bash
   git tag -a v1.1.0 -m "Release 1.1.0"
   git push origin v1.1.0
   ```

### Distribution

**Internal Testing:**
- Upload APK to Firebase App Distribution
- Share link with testers via email

**Google Play Store:**
1. Upload AAB to Play Console
2. Create release in "Internal Testing" track
3. Promote to "Production" after validation

**Rollback (Google Play):**
- Halt rollout at any percentage
- Revert to previous version in Play Console
- Google serves old APK to new installs

---

## Rollback Decision Tree

```
Production Issue Detected
        |
        v
    Critical?  (Crashes, data loss, security)
     /    \
   YES     NO
    |       |
    v       v
Rollback  Monitor
Immediately  (Fix in next release)
```

**Critical Issues:**
- App crashes on launch
- Data corruption
- Security vulnerability
- Feature completely broken for >50% users

**Non-Critical:**
- UI glitch affecting <10% users
- Performance regression <20%
- Non-blocking feature bug

---

## Monitoring Post-Release

### Web Metrics (via Analytics)

If Google Analytics or similar integrated:
- Page load time
- JavaScript errors
- User flow drop-offs

**Manual checks (first 24 hours):**
- Browser console errors (Chrome DevTools)
- Network tab for failed requests
- Lighthouse audit score

### Android Metrics

**Google Play Console:**
- Crash rate (target: < 0.5%)
- ANR rate (target: < 0.1%)
- Uninstall rate
- User reviews/ratings

**Firebase Crashlytics (if integrated):**
- Top crashes by occurrence
- Affected devices/OS versions

---

## Hotfix Process

**When rollback isn't immediate option:**

1. **Create hotfix branch:**
   ```bash
    git checkout master
   git checkout -b hotfix/critical-bug-fix
   ```

2. **Apply minimal fix** (no refactoring, no scope creep)

3. **Test hotfix:**
   ```bash
   npm test
   npm run e2e
   ```

4. **Fast-track merge:**
   ```bash
    git checkout master
   git merge hotfix/critical-bug-fix
    git push origin master
   ```

5. **Deploy immediately** (web via Actions, Android via manual build)

6. **Backport to feature branches if needed**

---

## Communication Protocol

### User-Facing Issues

**Severity 1 (Critical):**
- Post banner on app homepage
- Email notification (if user base has emails)
- Social media update

**Severity 2 (Major):**
- In-app notice on next launch
- GitHub release notes

**Severity 3 (Minor):**
- Mentioned in changelog only

### Internal Team

**Slack/Discord:**
- `#releases` channel for deploy notifications
- `#incidents` channel for critical issues

**GitHub:**
- Create issue for post-mortem
- Tag with `incident` label
- Assign to release manager

---

## Versioning Strategy

Follow **Semantic Versioning (semver):**

- `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

**Rules:**
- `MAJOR`: Breaking changes (e.g., storage schema incompatibility)
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes only

**Pre-release tags:**
- `1.2.0-beta.1` for beta testing
- `1.2.0-rc.1` for release candidates

---

## Changelog Maintenance

**Update `CHANGELOG.md` BEFORE merging to master:**

```markdown
## [1.2.0] - 2026-02-15

### Added
- Typed navigation constants for route safety
- Environment-based config for API URLs
- Storage schema versioning system

### Fixed
- Android SDK 34 foreground service compliance
- Overlay permission flow AppState sync

### Changed
- Updated overlay UX copy for clarity
```

**Categories:**
- `Added` - new features
- `Changed` - changes to existing features
- `Deprecated` - soon-to-be-removed features
- `Removed` - removed features
- `Fixed` - bug fixes
- `Security` - vulnerability patches

---

## Disaster Recovery

**If master branch corrupted:**

```bash
# Restore from last known good commit
git checkout master
git reset --hard <last-good-commit-hash>
git push --force origin master
```

**If production data lost (AsyncStorage):**
- No server-side backups (local-first app)
- Guide users to re-enter data
- Communicate issue transparently

**If keystore lost (Android):**
- **CRITICAL:** Cannot update existing Play Store app
- Must create new app listing with new package name
- Migrate users via in-app notice

**Prevention:**
- Store keystore in encrypted password manager
- Document keystore password in team vault
- Keep backup keystore in secure offline storage

---

## Automation Opportunities

**Current State:** Manual builds and deploys

**Future Enhancements:**
- **CI/CD for Android:** GitHub Actions workflow for APK/AAB builds
- **Automated version bumping:** Script to sync versions across files
- **Release notes generation:** Auto-generate from commit messages
- **Smoke test suite:** Run critical path tests before deploy

---

**Last Updated:** 2026-02-10  
**Owner:** Release Manager  
**Review Cycle:** Update after each major release
