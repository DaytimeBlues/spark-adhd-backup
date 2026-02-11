package com.sparkadhd;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class OverlayModule extends ReactContextBaseJavaModule {
  private static final String TAG = "OverlayModule";
  private static final String NOTIFICATION_PERMISSION = "android.permission.POST_NOTIFICATIONS";
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
    try {
      Log.d(TAG, "Starting overlay service");
      
      // Check notification permission for Android 13+
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        if (ContextCompat.checkSelfPermission(reactContext, NOTIFICATION_PERMISSION)
            != PackageManager.PERMISSION_GRANTED) {
          Log.w(TAG, "Notification permission not granted, service may not work properly");
        }
      }
      
      Intent intent = new Intent(reactContext, OverlayService.class);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        ContextCompat.startForegroundService(reactContext, intent);
      } else {
        reactContext.startService(intent);
      }
    } catch (Exception e) {
      Log.e(TAG, "Failed to start overlay service", e);
    }
  }

  @ReactMethod
  public void stopOverlay() {
    try {
      Log.d(TAG, "Stopping overlay service");
      Intent intent = new Intent(reactContext, OverlayService.class);
      reactContext.stopService(intent);
    } catch (Exception e) {
      Log.e(TAG, "Failed to stop overlay service", e);
    }
  }

  @ReactMethod
  public void updateCount(int count) {
    try {
      OverlayService.updateCount(count);
    } catch (Exception e) {
      Log.e(TAG, "Failed to update count", e);
    }
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
    try {
      boolean canDraw = Settings.canDrawOverlays(reactContext);
      promise.resolve(canDraw);
    } catch (Exception e) {
      Log.e(TAG, "Error checking overlay permission", e);
      promise.reject("ERROR", "Failed to check overlay permission", e);
    }
  }

  @ReactMethod
  public void requestOverlayPermission(Promise promise) {
    try {
      if (Settings.canDrawOverlays(reactContext)) {
        promise.resolve(true);
        return;
      }

      Intent intent = new Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:" + reactContext.getPackageName())
      );
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      reactContext.startActivity(intent);
      promise.resolve(false);
    } catch (Exception e) {
      Log.e(TAG, "Error requesting overlay permission", e);
      promise.reject("ERROR", "Failed to request overlay permission", e);
    }
  }

  @ReactMethod
  public void canPostNotifications(Promise promise) {
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        boolean hasPermission = ContextCompat.checkSelfPermission(
          reactContext,
          NOTIFICATION_PERMISSION
        ) == PackageManager.PERMISSION_GRANTED;
        promise.resolve(hasPermission);
      } else {
        // Notifications allowed by default on older Android versions
        promise.resolve(true);
      }
    } catch (Exception e) {
      Log.e(TAG, "Error checking notification permission", e);
      promise.reject("ERROR", "Failed to check notification permission", e);
    }
  }
}
