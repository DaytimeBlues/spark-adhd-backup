package com.sparkadhd;

import android.animation.ObjectAnimator;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.lang.ref.WeakReference;

public class OverlayService extends Service {
  private static final String TAG = "OverlayService";
  private static final String CHANNEL_ID = "spark_overlay";
  private static final int NOTIFICATION_ID = 1001;
  private static WeakReference<OverlayService> instanceRef;

  private WindowManager windowManager;
  private FrameLayout bubbleView;
  private TextView countView;
  private LinearLayout menuView;
  private View scrimView;
  private WindowManager.LayoutParams bubbleParams;
  private WindowManager.LayoutParams menuParams;
  private WindowManager.LayoutParams scrimParams;
  private boolean expanded;

  public static OverlayService getInstance() {
    return instance;
  }

  public static void updateCount(int count) {
    OverlayService instance = instanceRef != null ? instanceRef.get() : null;
    if (instance != null) {
      instance.setCount(count);
    } else {
      Log.w(TAG, "updateCount called but service instance is null");
    }
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Log.d(TAG, "onCreate - Starting overlay service");
    instanceRef = new WeakReference<>(this);
    windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
    createOverlay();
    startForeground(NOTIFICATION_ID, createNotification());
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    Log.d(TAG, "onDestroy - Stopping overlay service");
    if (bubbleView != null && windowManager != null) {
      try {
        windowManager.removeView(bubbleView);
      } catch (IllegalArgumentException e) {
        Log.w(TAG, "View already removed", e);
      }
      bubbleView = null;
    }
    if (instanceRef != null) {
      instanceRef.clear();
      instanceRef = null;
    }
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  public void collapseMenuFromJs() {
    collapseMenu();
  }

  public boolean isExpanded() {
    return expanded;
  }

  private void createOverlay() {
    bubbleView = new FrameLayout(this);
    int size = dpToPx(56);

    countView = new TextView(this);
    int persistedCount = getSharedPreferences(PREFS_NAME, MODE_PRIVATE).getInt(KEY_LAST_COUNT, 0);
    countView.setText(String.valueOf(persistedCount));
    countView.setTextColor(0xFFFFFFFF);
    countView.setTextSize(16f);
    countView.setGravity(Gravity.CENTER);

    GradientDrawable background = new GradientDrawable();
    background.setColor(0xFF2D89EF);
    background.setCornerRadius(size / 2f);

    bubbleView.setBackground(background);
    FrameLayout.LayoutParams bubbleLayout = new FrameLayout.LayoutParams(size, size);
    bubbleLayout.gravity = Gravity.CENTER;
    bubbleView.addView(countView, bubbleLayout);

    bubbleParams = new WindowManager.LayoutParams(
      WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.WRAP_CONTENT,
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        : WindowManager.LayoutParams.TYPE_PHONE,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT
    );
    bubbleParams.gravity = Gravity.TOP | Gravity.START;
    bubbleParams.x = dpToPx(16);
    bubbleParams.y = dpToPx(120);
    bubbleView.setOnTouchListener(new BubbleTouchListener());

    try {
      windowManager.addView(bubbleView, bubbleParams);
    } catch (SecurityException | RuntimeException exception) {
      stopSelf();
    }
  }

  private void toggleExpanded() {
    if (expanded) {
      collapseMenu();
    } else {
      expandMenu();
    }
  }

  private void expandMenu() {
    if (menuView != null) {
      return;
    }
    expanded = true;
    addScrim();

    menuView = new LinearLayout(this);
    menuView.setOrientation(LinearLayout.VERTICAL);
    menuView.setPadding(dpToPx(12), dpToPx(12), dpToPx(12), dpToPx(12));

    GradientDrawable background = new GradientDrawable();
    background.setColor(0xFF1A1A2E);
    background.setCornerRadius(dpToPx(16));
    background.setStroke(dpToPx(1), 0xFF2D89EF);
    menuView.setBackground(background);

    addMenuItem("CBT", "CBTGuide", false);
    addMenuItem("Tasks", "FogCutter", false);
    addMenuItem("TODO", "Tasks", false);
    addMenuItem("Breathing", "Anchor", false);
    addMenuItem("Thinking Help", "CheckIn", false);
    addMenuItem("Voice Task", "Tasks", true);

    menuParams = new WindowManager.LayoutParams(
      dpToPx(220),
      WindowManager.LayoutParams.WRAP_CONTENT,
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        : WindowManager.LayoutParams.TYPE_PHONE,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT
    );
    menuParams.gravity = Gravity.TOP | Gravity.START;
    menuParams.x = bubbleParams.x;
    menuParams.y = Math.max(dpToPx(16), bubbleParams.y - dpToPx(260));

    try {
      windowManager.addView(menuView, menuParams);
      ObjectAnimator animator = ObjectAnimator.ofFloat(menuView, "translationY", 24f, 0f);
      animator.setDuration(200);
      animator.start();
    } catch (SecurityException | RuntimeException exception) {
      collapseMenu();
    }
  }

  private void addMenuItem(String label, String route, boolean autoRecord) {
    TextView menuItem = new TextView(this);
    menuItem.setText(label);
    menuItem.setTextColor(0xFFFFFFFF);
    menuItem.setTextSize(15f);
    menuItem.setPadding(dpToPx(10), dpToPx(10), dpToPx(10), dpToPx(10));
    menuItem.setOnClickListener((ignored) -> {
      launchRoute(route, autoRecord);
      collapseMenu();
    });
    menuView.addView(menuItem);
  }

  private void addScrim() {
    if (scrimView != null) {
      return;
    }
    scrimView = new View(this);
    scrimView.setBackgroundColor(0x00000000);
    scrimView.setOnClickListener((ignored) -> collapseMenu());

    scrimParams = new WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        : WindowManager.LayoutParams.TYPE_PHONE,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT
    );
    scrimParams.gravity = Gravity.TOP | Gravity.START;
    try {
      windowManager.addView(scrimView, scrimParams);
    } catch (SecurityException | RuntimeException ignored) {
      scrimView = null;
    }
  }

  private void collapseMenu() {
    expanded = false;
    removeViewIfAttached(menuView);
    removeViewIfAttached(scrimView);
    menuView = null;
    scrimView = null;
  }

  private void launchRoute(String route, boolean autoRecord) {
    Intent launchIntent = new Intent(getApplicationContext(), MainActivity.class);
    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    launchIntent.putExtra("route", route);
    if (autoRecord) {
      launchIntent.putExtra("autoRecord", true);
    }
    startActivity(launchIntent);
  }

  private void removeViewIfAttached(View view) {
    if (view == null || windowManager == null) {
      return;
    }
    try {
      if (view.isAttachedToWindow()) {
        windowManager.removeView(view);
      }
    } catch (IllegalArgumentException ignored) {
    }
  }

  private void setCount(int count) {
    SharedPreferences preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
    preferences.edit().putInt(KEY_LAST_COUNT, count).apply();
    if (countView != null) {
      countView.post(() -> countView.setText(String.valueOf(count)));
    }
  }

  private Notification createNotification() {
    NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && manager != null) {
      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "Spark Overlay",
        NotificationManager.IMPORTANCE_LOW
      );
      manager.createNotificationChannel(channel);
    }

    return new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Spark tasks")
      .setContentText("Bubble is running")
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setOngoing(true)
      .build();
  }

  private int dpToPx(int dp) {
    float density = getResources().getDisplayMetrics().density;
    return Math.round(dp * density);
  }

  private class BubbleTouchListener implements View.OnTouchListener {
    private int initialX;
    private int initialY;
    private float initialTouchX;
    private float initialTouchY;
    private boolean moved;

    @Override
    public boolean onTouch(View view, MotionEvent event) {
      switch (event.getAction()) {
        case MotionEvent.ACTION_DOWN:
          moved = false;
          initialX = bubbleParams.x;
          initialY = bubbleParams.y;
          initialTouchX = event.getRawX();
          initialTouchY = event.getRawY();
          return true;
        case MotionEvent.ACTION_MOVE:
          bubbleParams.x = initialX + (int) (event.getRawX() - initialTouchX);
          bubbleParams.y = initialY + (int) (event.getRawY() - initialTouchY);
          windowManager.updateViewLayout(bubbleView, bubbleParams);
          if (Math.abs(event.getRawX() - initialTouchX) > 10 || Math.abs(event.getRawY() - initialTouchY) > 10) {
            moved = true;
          }
          return true;
        case MotionEvent.ACTION_UP:
          if (!moved) {
            toggleExpanded();
          }
          return true;
        default:
          return false;
      }
    }
  }
}
