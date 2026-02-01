package com.sparkadhd;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class OverlayModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  public OverlayModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
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
    OverlayService.updateCount(count);
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

    Intent intent = new Intent(
      Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
      Uri.parse("package:" + reactContext.getPackageName())
    );
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    reactContext.startActivity(intent);
    promise.resolve(false);
  }
}
