# Overlay Service Stability Validation

## Objective
Verify OverlayService reliability, lifecycle correctness, and resilience under stress conditions.

---

## Stability Test Suite

### Test 1: Long-Running Service Stability

**Duration:** 8 hours minimum

**Setup:**
1. Build debug APK and install on physical device
2. Enable Developer Options → "Stay awake" (keep screen on while charging)
3. Plug device into power
4. Enable overlay from Home screen

**Monitoring:**
```bash
# Watch service status
watch -n 30 'adb shell dumpsys activity services com.sparkadhd.OverlayService'

# Monitor memory usage
adb shell dumpsys meminfo com.sparkadhd | grep TOTAL

# Track CPU usage
adb shell top -n 1 -d 1 | grep sparkadhd
```

**Success Criteria:**
- [ ] Service remains running for 8+ hours
- [ ] Memory usage stable (no continuous growth)
- [ ] CPU usage < 1% when idle
- [ ] No ANRs or crashes in logcat
- [ ] Overlay bubble remains responsive

**Red Flags:**
- Memory leak (heap size grows unbounded)
- Service restarting repeatedly
- Battery drain > 5% per hour (background)
- UI thread blocking (jank in logcat)

---

### Test 2: Count Persistence Verification

**Objective:** Ensure SharedPreferences correctly saves/restores count.

**Steps:**
1. Enable overlay
2. Set count to specific value (e.g., via integration test or manual trigger)
3. Verify bubble displays correct count
4. Force-stop app:
   ```bash
   adb shell am force-stop com.sparkadhd
   ```
5. Restart app and re-enable overlay
6. **Verify:** Bubble shows same count as before force-stop

**Test Cases:**
- Count = 0 (initial state)
- Count = 5 (typical value)
- Count = 999 (edge case: large number)

**Success Criteria:**
- [ ] Count persists across service restarts
- [ ] Count persists across app restarts
- [ ] SharedPreferences file readable:
   ```bash
   adb shell run-as com.sparkadhd cat shared_prefs/spark_overlay_prefs.xml
   ```

---

### Test 3: Service Crash Recovery

**Objective:** Verify service handles unexpected crashes gracefully.

**Setup:**
1. Enable overlay
2. Inject crash via test hook (or simulate via `kill` command):
   ```bash
   # Find service PID
   adb shell ps | grep com.sparkadhd
   
   # Kill service (not entire app)
   adb shell kill -9 <service_pid>
   ```

**Expected Behavior:**
- Service does NOT auto-restart (Android doesn't restart foreground services after kill)
- App detects service stopped (via service binding)
- Switch updates to OFF state
- No ANR or crash dialog

**Success Criteria:**
- [ ] No crash dialog shown to user
- [ ] App remains functional
- [ ] User can re-enable overlay manually

---

### Test 4: WindowManager Lifecycle Safety

**Objective:** Ensure view attachment/detachment doesn't leak windows.

**Sensitive Paths (from code review):**
- `createOverlay()` → `windowManager.addView()` (line ~80 OverlayService.java)
- `onDestroy()` → `windowManager.removeView()` (line ~110 OverlayService.java)

**Test Scenarios:**

#### 4a: Rapid Start/Stop
1. Toggle overlay ON
2. Immediately toggle OFF (within 100ms)
3. Repeat 20 times
4. Check logcat for:
   ```
   WindowManager: android.view.WindowLeaked
   IllegalArgumentException: View not attached to window manager
   ```

**Success:** No leaked window errors

#### 4b: Service Killed While View Attached
1. Enable overlay
2. Force-stop app while service running
3. Restart app
4. **Verify:** No "View not attached" errors

#### 4c: Permission Revoked While View Displayed
1. Enable overlay
2. Revoke `SYSTEM_ALERT_WINDOW` permission via appops:
   ```bash
   adb shell appops set com.sparkadhd SYSTEM_ALERT_WINDOW deny
   ```
3. Return to app
4. **Verify:**
   - Service stops cleanly
   - No SecurityException crash
   - View removed without leak

---

### Test 5: Multi-App Interaction

**Objective:** Verify overlay works correctly when user switches apps.

**Steps:**
1. Enable overlay (bubble visible over Spark app)
2. Press Home button
3. Open Chrome browser
4. **Verify:** Overlay bubble visible over Chrome
5. Open Settings app
6. **Verify:** Overlay bubble visible over Settings
7. Return to Spark app
8. Disable overlay
9. **Verify:** Bubble disappears from all contexts

**Success Criteria:**
- [ ] Overlay persists across app switches
- [ ] Touch events don't interfere with underlying apps
- [ ] Z-order correct (bubble always on top)
- [ ] No rendering artifacts when switching

---

### Test 6: Foreground Service Notification (SDK 34)

**Objective:** Verify notification compliance for targetSdkVersion 34.

**Setup:** Device running Android 14 (API 34) or higher

**Steps:**
1. Enable overlay
2. Pull down notification shade
3. **Verify notification present with:**
   - App icon
   - Title: "Focus Overlay Active" or similar
   - Description mentions task count display
   - Notification channel: "Overlay Service"

4. Tap notification
5. **Verify:** Opens app or no-op (not crash)

6. Swipe notification away (if dismissible)
7. **Verify:** Service stops OR notification reappears (persistent)

**Success Criteria:**
- [ ] Notification appears immediately on service start
- [ ] Notification uses `specialUse` foreground service type
- [ ] Notification text is user-friendly
- [ ] No "App is using battery" nag separate from our notification

---

### Test 7: Stress Test - Device Resource Constraints

**Objective:** Verify service behavior under low memory/CPU.

#### 7a: Low Memory
1. Enable overlay
2. Open 10+ heavy apps (Chrome with many tabs, games, etc.)
3. Monitor with:
   ```bash
   adb shell dumpsys meminfo com.sparkadhd
   ```
4. **Expected:** System may kill service (`onDestroy` called), but no crash
5. **Verify:** App gracefully handles service death, switch updates correctly

#### 7b: Background Restrictions
1. Enable overlay
2. Go to Settings → Apps → Spark → Battery → "Restricted"
3. **Verify:** Service behavior (may stop in Doze mode)
4. User taps overlay switch
5. **Verify:** Prompt to disable battery optimization OR clear error message

---

## Automated Stability Checks

### ADB Script for Overnight Monitoring

```bash
#!/bin/bash
# overlay_stability_monitor.sh

LOGFILE="overlay_stability_$(date +%Y%m%d_%H%M%S).log"
DURATION_HOURS=8

echo "Starting $DURATION_HOURS hour stability test..." | tee -a $LOGFILE
echo "Timestamp,Memory(KB),CPU(%),ServiceState" | tee -a $LOGFILE

END_TIME=$(($(date +%s) + $DURATION_HOURS * 3600))

while [ $(date +%s) -lt $END_TIME ]; do
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  MEM=$(adb shell dumpsys meminfo com.sparkadhd | grep "TOTAL" | awk '{print $2}')
  CPU=$(adb shell top -n 1 | grep sparkadhd | awk '{print $9}')
  SERVICE=$(adb shell dumpsys activity services com.sparkadhd.OverlayService | grep "app=" | wc -l)
  
  echo "$TIMESTAMP,$MEM,$CPU,$SERVICE" | tee -a $LOGFILE
  
  sleep 300  # Check every 5 minutes
done

echo "Stability test complete. Check $LOGFILE" | tee -a $LOGFILE
```

**Usage:**
```bash
chmod +x overlay_stability_monitor.sh
./overlay_stability_monitor.sh &
```

---

## Success Metrics Summary

### Reliability Targets
- **Uptime:** 99.9% during enabled state (8 hours test)
- **Crash Rate:** 0% (zero crashes in test suite)
- **Memory Growth:** < 5MB over 8 hours
- **CPU Usage:** < 1% average (when not updating count)

### Known Acceptable Failures
- Service killed by Android due to extreme memory pressure (> 90% RAM used system-wide)
- Service stopped when user force-stops app manually
- Service denied start if `SYSTEM_ALERT_WINDOW` permission revoked

---

## Regression Checklist

Before merging changes to OverlayService or OverlayModule:

- [ ] Run Test 1 (8-hour stability)
- [ ] Run Test 2 (persistence)
- [ ] Run Test 4a-4c (lifecycle safety)
- [ ] Run Test 6 (SDK 34 notification)
- [ ] No new WindowManager leaks in logcat
- [ ] Code review for thread safety (count updates use `view.post()`)

---

**Last Updated:** 2026-02-10  
**Related Files:**
- `android/app/src/main/java/com/sparkadhd/OverlayService.java`
- `android/app/src/main/AndroidManifest.xml` (service declaration)
- `docs/OVERLAY_PERMISSION_VALIDATION.md` (permission flow tests)
