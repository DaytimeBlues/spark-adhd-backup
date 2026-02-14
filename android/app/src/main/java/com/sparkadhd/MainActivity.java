package com.sparkadhd;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactInstanceManager.ReactInstanceEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {
  @Override
  protected String getMainComponentName() {
    return "SparkADHD";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
      this,
      getMainComponentName(),
      BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    handleRouteIntent(getIntent());
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    handleRouteIntent(intent);
  }

  private void handleRouteIntent(Intent intent) {
    if (intent == null) {
      return;
    }

    String route = intent.getStringExtra("route");
    if (route == null || route.isEmpty()) {
      return;
    }

    boolean autoRecord = intent.getBooleanExtra("autoRecord", false);

    ReactInstanceManager manager = getReactNativeHost().getReactInstanceManager();
    ReactContext context = manager.getCurrentReactContext();
    if (context == null) {
      final ReactInstanceEventListener listener = new ReactInstanceEventListener() {
        @Override
        public void onReactContextInitialized(ReactContext initializedContext) {
          emitOverlayRouteIntent(initializedContext, route, autoRecord);
          manager.removeReactInstanceEventListener(this);
        }
      };

      manager.addReactInstanceEventListener(listener);
      if (!manager.hasStartedCreatingInitialContext()) {
        manager.createReactContextInBackground();
      }
      return;
    }

    emitOverlayRouteIntent(context, route, autoRecord);
  }

  private void emitOverlayRouteIntent(ReactContext context, String route, boolean autoRecord) {
    WritableMap payload = Arguments.createMap();
    payload.putString("route", route);
    payload.putBoolean("autoRecord", autoRecord);

    context
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit("overlayRouteIntent", payload);
  }
}
