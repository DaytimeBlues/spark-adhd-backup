# Ship-Readiness Validation Guide

## Android Build Blockers

### Environment Requirements

**CRITICAL: Android builds require Java Development Kit (JDK)**

Current environment status: ❌ **JDK NOT INSTALLED**

#### Evidence:
```
JAVA_HOME not set
No JDK found in PATH
```

#### Impact:
- Cannot run `./gradlew assembleDebug` or `assembleRelease`
- Cannot validate native Android builds
- Cannot test overlay service on physical/emulated devices
- Cannot generate APK/AAB for distribution

#### Resolution Steps:

1. **Install JDK 17 (recommended for Android SDK 34)**
   - Windows: Download from [Adoptium](https://adoptium.net/) or Oracle
   - macOS: `brew install openjdk@17`
   - Linux: `sudo apt install openjdk-17-jdk`

2. **Set JAVA_HOME environment variable**
   ```bash
   # Windows (System Environment Variables)
   JAVA_HOME=C:\Program Files\Java\jdk-17
   
   # macOS/Linux (add to ~/.bashrc or ~/.zshrc)
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
   export PATH=$JAVA_HOME/bin:$PATH
   ```

3. **Verify installation**
   ```bash
   java -version
   # Should show: openjdk version "17.x.x"
   
   echo $JAVA_HOME
   # Should show: /path/to/jdk-17
   ```

4. **Test Gradle build**
   ```bash
   cd android
   ./gradlew :app:assembleDebug
   ```

### Alternative: Cloud Build Services

If local build is not feasible, consider:
- **Expo EAS Build** (requires migration to Expo managed workflow)
- **GitHub Actions** with Android build environment
- **Bitrise** or other CI/CD with Android support

### Current Validation Status

✅ **Code-level checks completed:**
- AndroidManifest.xml compliant with SDK 34
- Foreground service type declared (`specialUse`)
- Build.gradle targets SDK 34
- ProGuard rules present

❌ **Build validation BLOCKED:**
- Native build compilation
- APK/AAB generation
- Device/emulator testing
- Overlay service runtime behavior

### Next Steps

1. Install JDK 17
2. Run `cd android && ./gradlew :app:assembleDebug`
3. If successful, proceed to device testing
4. If failed, review Gradle error output and resolve dependencies

---

**Last Updated:** 2026-02-10  
**Blocker Severity:** HIGH (blocks production release validation)
