# ANDROID KNOWLEDGE BASE

## OVERVIEW
Native Android module with custom overlay service and Gradle-based build.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| App build config | `android/app/build.gradle` | SDK versions, deps, signing |
| Project build config | `android/build.gradle` | AGP, buildTools, ext vars |
| Manifest | `android/app/src/main/AndroidManifest.xml` | Permissions + services |
| Network security | `android/app/src/main/res/xml/network_security_config.xml` | Cleartext dev hosts |
| Proguard rules | `android/app/proguard-rules.pro` | Release keep rules |
| Gradle wrapper | `android/gradle/wrapper/gradle-wrapper.properties` | Gradle 8.6 |

## CONVENTIONS
- SDK levels: minSdk 26, target/compile 34.
- Release signing reads KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD env vars.
- Hermes dependency is conditional; confirm where `hermesEnabled` is set.

## ANTI-PATTERNS (THIS DIRECTORY)
- Do not hardcode signing credentials; use env vars.
- Do not loosen network security config beyond local dev hosts.
- Do not remove overlay permissions without updating Home/OverlayService flow.
