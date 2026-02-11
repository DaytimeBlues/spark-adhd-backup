# Overlay Permission Flow Validation

## Test Checklist for Android Overlay Feature

### Prerequisites
- Physical Android device or emulator running API 26+ (Android 8.0+)
- APK built with debug or release configuration
- ADB access enabled

---

## Test 1: Initial Permission Request Flow

**Objective:** Verify permission request triggers and completes correctly.

### Steps:
1. Fresh install app or clear app data:
   ```bash
   adb shell pm clear com.sparkadhd
   ```

2. Launch app and navigate to Home screen

3. Toggle "Focus Overlay" switch to ON

4. **Expected behavior:**
   - App should open Android system settings page for "Display over other apps"
   - App should appear in the list
   - Toggle switch should show app name correctly

5. Grant permission by toggling "Allow display over other apps" ON

6. Press back button to return to app

7. **Verify:**
   - Switch state updates to ON automatically (AppState listener)
   - No toast/error message displayed
   - UI remains responsive

### Pass Criteria:
- ✅ Settings page opens correctly
- ✅ Switch updates to ON after returning
- ✅ No crashes or ANRs

---

## Test 2: Permission Already Granted

**Objective:** Verify behavior when permission exists.

### Steps:
1. With permission already granted (from Test 1)

2. Toggle "Focus Overlay" switch to ON

3. **Expected behavior:**
   - OverlayService starts immediately
   - No settings page opened
   - Overlay bubble appears on screen

4. **Verify overlay bubble:**
   - Visible on top of app
   - Shows "0" initially
   - Positioned correctly (not obstructing content)

### Pass Criteria:
- ✅ Overlay starts without settings redirect
- ✅ Bubble displays count
- ✅ Bubble persists when switching apps

---

## Test 3: Permission Denied by User

**Objective:** Verify graceful handling of denial.

### Steps:
1. Revoke permission via settings:
   ```bash
   adb shell appops set com.sparkadhd SYSTEM_ALERT_WINDOW deny
   ```

2. Return to app Home screen

3. Toggle "Focus Overlay" switch to ON

4. Settings page should open

5. **Do NOT grant permission** - press back button

6. **Verify:**
   - Switch returns to OFF state
   - App remains functional
   - No crash or freeze

### Pass Criteria:
- ✅ Switch resets to OFF
- ✅ No permission loops (doesn't keep opening settings)
- ✅ App usable without overlay feature

---

## Test 4: Overlay Service Lifecycle

**Objective:** Verify service starts/stops cleanly.

### Steps:
1. Grant permission and enable overlay (switch ON)

2. Verify service running:
   ```bash
   adb shell dumpsys activity services com.sparkadhd.OverlayService
   ```

3. Toggle switch OFF

4. **Verify:**
   - Overlay bubble disappears
   - Service stops (check dumpsys again)
   - No memory leaks (check logcat for warnings)

5. Toggle switch ON again (Test restart)

6. **Verify:**
   - Service restarts cleanly
   - Overlay reappears
   - Count persists from SharedPreferences

### Pass Criteria:
- ✅ Service starts/stops on toggle
- ✅ No WindowManager leaked window errors
- ✅ Count persistence works

---

## Test 5: App State Transitions

**Objective:** Verify AppState listener synchronizes permission.

### Steps:
1. Enable overlay (switch ON)

2. Minimize app (press Home button)

3. Revoke permission via system settings manually

4. Return to app by tapping icon

5. **Verify:**
   - AppState change event fires
   - Permission check runs (`canDrawOverlays()`)
   - Switch updates to OFF automatically
   - Service stops gracefully

### Pass Criteria:
- ✅ Permission sync works on foreground
- ✅ No stale UI state
- ✅ No crashes from service running without permission

---

## Test 6: Edge Cases

### 6a: Rapid Toggle
- Toggle switch ON/OFF rapidly (5 times in 2 seconds)
- **Verify:** No crashes, service state consistent with switch

### 6b: Permission Revoked While Service Running
- Start overlay → minimize app → revoke permission
- Return to app
- **Verify:** Service stops, switch updates to OFF

### 6c: Low Memory Scenario
- Enable overlay → launch many heavy apps
- Return to Spark app
- **Verify:** Service restarts if killed, count restored

### 6d: Foreground Service Notification (SDK 34+)
- Enable overlay
- Pull down notification shade
- **Verify:** Foreground service notification appears (required for SDK 34)
- Notification text should describe overlay purpose

---

## Logcat Monitoring

While testing, monitor logcat for critical logs:

```bash
adb logcat -s ReactNativeJS:V OverlayModule:V OverlayService:V
```

**Red flags:**
- `WindowManager: android.view.WindowLeaked`
- `IllegalStateException: Service not registered`
- `SecurityException: SYSTEM_ALERT_WINDOW`
- `NullPointerException` in OverlayModule or OverlayService

---

## Automated Checks (via Detox)

**Note:** Overlay testing in Detox is limited (cannot interact with system settings).

Feasible checks:
- Switch toggle triggers native module call
- Switch state updates correctly when permission exists
- Service start intent broadcast verified

**Not feasible via Detox:**
- System settings interaction
- Actual overlay rendering validation
- Permission grant flow

---

## Summary Checklist

Before considering overlay feature production-ready:

- [ ] Test 1 (Initial request) passes
- [ ] Test 2 (Already granted) passes
- [ ] Test 3 (Denial handling) passes
- [ ] Test 4 (Lifecycle) passes
- [ ] Test 5 (AppState sync) passes
- [ ] All edge cases (6a-6d) pass
- [ ] No memory leaks in logcat
- [ ] Foreground service notification compliant (SDK 34)

---

**Last Updated:** 2026-02-10  
**Related Files:**
- `android/app/src/main/java/com/sparkadhd/OverlayModule.java`
- `android/app/src/main/java/com/sparkadhd/OverlayService.java`
- `src/screens/HomeScreen.tsx` (lines 124-176)
