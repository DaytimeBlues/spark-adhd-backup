package com.sparkadhd;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class OverlayModule extends ReactContextBaseJavaModule {
  private static final int OVERLAY_PERMISSION_REQUEST_CODE = 4242;
  private static final String PREFS_NAME = "spark_overlay_prefs";
  private static final String KEY_LAST_COUNT = "last_count";
  private final ReactApplicationContext reactContext;
  private Promise pendingPermissionPromise;
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

  @ReactMethod
  public void startOverlay() {
    Intent intent = new Intent(reactContext, OverlayService.class);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      ContextCompat.startForegroundService(reactContext, intent);
    } else {
      reactContext.startService(intent);
    }
  }

  @ReactMethod
  public void stopOverlay() {
    Intent intent = new Intent(reactContext, OverlayService.class);
    reactContext.stopService(intent);
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
      promise.resolve(true);
      return;
    }

    if (pendingPermissionPromise != null) {
      promise.reject("E_OVERLAY_REQUEST_IN_PROGRESS", "Overlay permission request already in progress");
      return;
    }

    Activity currentActivity = getCurrentActivity();
    if (currentActivity == null) {
      promise.reject("E_ACTIVITY_UNAVAILABLE", "Activity is not available to request overlay permission");
      return;
    }

    Intent intent = new Intent(
      Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
      Uri.parse("package:" + reactContext.getPackageName())
    );
    pendingPermissionPromise = promise;

    try {
      currentActivity.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE);
    } catch (Exception exception) {
      pendingPermissionPromise = null;
      promise.reject("E_OVERLAY_PERMISSION_REQUEST_FAILED", exception);
    }
  }

  private void resolvePendingPermissionPromise() {
    if (pendingPermissionPromise == null) {
      return;
    }

    boolean canDraw = Settings.canDrawOverlays(reactContext);
    pendingPermissionPromise.resolve(canDraw);
    pendingPermissionPromise = null;
  }
}
