---
description: How to prepare Capacitor projects for Android Studio with AGP 9.0+
---

# Android Studio Readiness Guide (AGP 9.0+)

Use this checklist to prune legacy configurations before importing a Capacitor project into Android Studio.

## 1. Clean `android/gradle.properties`

Modern AGP 9+ is stricter. Remove deprecated flags:

```properties
# REMOVE THESE - They cause build warnings or errors
android.defaults.buildfeatures.resvalues=true
android.usesSdkInManifest.disallowed=false
android.r8.optimizedResourceShrinking=false
android.builtInKotlin=false
android.newDsl=false
```

Keep only essentials:

```properties
org.gradle.jvmargs=-Xmx2048m
android.useAndroidX=true
android.uniquePackageNames=false
# ADD THIS - Improves import performance for AGP 9.0+
android.dependency.excludeLibraryComponentsFromConstraints=true
```

## 2. Modernize Repositories

If you see `flatDir` warnings in `app/build.gradle`, replace it.

**Instead of:**
```gradle
repositories {
    flatDir { dirs 'libs' }
}
dependencies {
    implementation name: 'some-lib', ext: 'aar'
}
```

**Do this:**
```gradle
dependencies {
    implementation fileTree(include: ['*.jar', '*.aar'], dir: 'libs')
}
```

## 3. Enable Features Explicitly

If your app needs `resValues`, enable it in the `android` block of `app/build.gradle`:

```gradle
android {
    buildFeatures {
        resValues true
    }
}
```

## 4. Prioritize Proguard Optimization

In `app/build.gradle`, always use the optimized variant:

```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

## 5. Deep Dependency Patches (`node_modules`)

If your build fails with an error about `proguard-android.txt` no longer being supported:

**The Error:**
> `'getDefaultProguardFile('proguard-android.txt')' is no longer supported since it includes '-dontoptimize'...`

**The Fix:**
Search and replace globally in `node_modules` for Android build files:

- **Search for:** `proguard-android.txt`
- **Replace with:** `proguard-android-optimize.txt`

**Key files to check:**
- `node_modules/@capacitor/android/capacitor/build.gradle`
- `node_modules/@capacitor/haptics/android/build.gradle` (and other Capacitor plugins)
