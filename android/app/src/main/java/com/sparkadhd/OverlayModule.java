package com.sparkadhd;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class OverlayModule extends ReactContextBaseJavaModule {
  private static final int OVERLAY_PERMISSION_REQUEST_CODE = 4242;
  private static final long PERMISSION_TIMEOUT_MS = 20000L;
  private static final String PREFS_NAME = "spark_overlay_prefs";
  private static final String KEY_LAST_COUNT = "last_count";
  private static final String EVENT_OVERLAY_STARTED = "overlay_started";
  private static final String EVENT_OVERLAY_STOPPED = "overlay_stopped";
  private static final String EVENT_PERMISSION_REQUESTED = "overlay_permission_requested";
  private static final String EVENT_PERMISSION_RESULT = "overlay_permission_result";
  private static final String EVENT_PERMISSION_TIMEOUT = "overlay_permission_timeout";
  private static final String EVENT_PERMISSION_ERROR = "overlay_permission_error";
  private final ReactApplicationContext reactContext;
  private final Handler mainHandler = new Handler(Looper.getMainLooper());
  private Promise pendingPermissionPromise;
  private final Runnable permissionTimeoutRunnable = () -> {
    if (pendingPermissionPromise != null) {
      emitEvent(EVENT_PERMISSION_TIMEOUT, null);
      pendingPermissionPromise.reject(
        "E_OVERLAY_PERMISSION_TIMEOUT",
        "Overlay permission request timed out"
      );
      pendingPermissionPromise = null;
    }
  };
  private final BaseActivityEventListener activityEventListener = new BaseActivityEventListener() {
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
      if (requestCode == OVERLAY_PERMISSION_REQUEST_CODE) {
        resolvePendingPermissionPromise();
      }
    }
  };

  public OverlayModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.reactContext.addActivityEventListener(activityEventListener);
  }

  @Override
  public String getName() {
    return "OverlayModule";
  }

  @Override
  public void invalidate() {
    mainHandler.removeCallbacks(permissionTimeoutRunnable);
    if (pendingPermissionPromise != null) {
      pendingPermissionPromise.reject(
        "E_OVERLAY_REQUEST_CANCELLED",
        "Overlay permission request cancelled"
      );
      pendingPermissionPromise = null;
    }
    reactContext.removeActivityEventListener(activityEventListener);
    super.invalidate();
  }

  @ReactMethod
  public void startOverlay() {
    Intent intent = new Intent(reactContext, OverlayService.class);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      ContextCompat.startForegroundService(reactContext, intent);
    } else {
      reactContext.startService(intent);
    }
    emitEvent(EVENT_OVERLAY_STARTED, null);
  }

  @ReactMethod
  public void stopOverlay() {
    Intent intent = new Intent(reactContext, OverlayService.class);
    reactContext.stopService(intent);
    emitEvent(EVENT_OVERLAY_STOPPED, null);
  }

  @ReactMethod
  public void addListener(String eventName) {
    // Required by React Native's NativeEventEmitter.
  }

  @ReactMethod
  public void removeListeners(double count) {
    // Required by React Native's NativeEventEmitter.
  }

  @ReactMethod
  public void updateCount(int count) {
    OverlayService service = OverlayService.getInstance();
    if (service != null) {
      OverlayService.updateCount(count);
      return;
    }

    SharedPreferences preferences = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    preferences.edit().putInt(KEY_LAST_COUNT, count).apply();
  }

  @ReactMethod
  public void collapseOverlay() {
    OverlayService service = OverlayService.getInstance();
    if (service != null) {
      service.collapseMenuFromJs();
    }
  }

  @ReactMethod
  public void isExpanded(Promise promise) {
    OverlayService service = OverlayService.getInstance();
    promise.resolve(service != null && service.isExpanded());
  }

  @ReactMethod
  public void canDrawOverlays(Promise promise) {
    boolean canDraw = Settings.canDrawOverlays(reactContext);
    promise.resolve(canDraw);
  }

  @ReactMethod
  public void requestOverlayPermission(Promise promise) {
    if (Settings.canDrawOverlays(reactContext)) {
      WritableMap payload = Arguments.createMap();
      payload.putBoolean("granted", true);
      emitEvent(EVENT_PERMISSION_RESULT, payload);
      promise.resolve(true);
      return;
    }

    if (pendingPermissionPromise != null) {
      emitEvent(EVENT_PERMISSION_ERROR, null);
      promise.reject("E_OVERLAY_REQUEST_IN_PROGRESS", "Overlay permission request already in progress");
      return;
    }

    Activity currentActivity = getCurrentActivity();
    if (currentActivity == null) {
      emitEvent(EVENT_PERMISSION_ERROR, null);
      promise.reject("E_ACTIVITY_UNAVAILABLE", "Activity is not available to request overlay permission");
      return;
    }

    Intent intent = new Intent(
      Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
      Uri.parse("package:" + reactContext.getPackageName())
    );
    pendingPermissionPromise = promise;

    try {
      emitEvent(EVENT_PERMISSION_REQUESTED, null);
      mainHandler.postDelayed(permissionTimeoutRunnable, PERMISSION_TIMEOUT_MS);
      currentActivity.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE);
    } catch (Exception exception) {
      mainHandler.removeCallbacks(permissionTimeoutRunnable);
      pendingPermissionPromise = null;
      emitEvent(EVENT_PERMISSION_ERROR, null);
      promise.reject("E_OVERLAY_PERMISSION_REQUEST_FAILED", exception);
    }
  }

  private void resolvePendingPermissionPromise() {
    if (pendingPermissionPromise == null) {
      return;
    }

    mainHandler.removeCallbacks(permissionTimeoutRunnable);
    boolean canDraw = Settings.canDrawOverlays(reactContext);
    WritableMap payload = Arguments.createMap();
    payload.putBoolean("granted", canDraw);
    emitEvent(EVENT_PERMISSION_RESULT, payload);
    pendingPermissionPromise.resolve(canDraw);
    pendingPermissionPromise = null;
  }

  private void emitEvent(String eventName, WritableMap payload) {
    if (reactContext.hasActiveCatalystInstance()) {
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, payload);
    }
  }
}
