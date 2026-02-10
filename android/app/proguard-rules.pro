# Add project specific ProGuard rules here.

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Google Play Services
-keep class com.google.android.gms.** { *; }

# Spark ADHD native modules
-keep class com.sparkadhd.** { *; }

# Keep @ReactMethod annotations
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# AndroidX Notifications
-keep class androidx.core.app.NotificationCompat** { *; }
-keep class androidx.core.app.NotificationManagerCompat { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
