package com.sparkadhd;

import android.animation.ObjectAnimator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.view.animation.DecelerateInterpolator;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class OverlayService extends Service {
  private static final String CHANNEL_ID = "spark_overlay";
  private static final int NOTIFICATION_ID = 1001;
  private static final String ACTION_STOP_OVERLAY = "com.sparkadhd.action.STOP_OVERLAY";
  private static final String PREFS_NAME = "spark_overlay_prefs";
  private static final String KEY_LAST_COUNT = "last_count";
  private static final String KEY_BUBBLE_X = "bubble_x";
  private static final String KEY_BUBBLE_Y = "bubble_y";
  private static final int DRAG_THRESHOLD_DP = 6;
  private static final int MENU_OPEN_TRANSLATION_DP = 16;
  private static final int MENU_ANIMATION_DURATION_MS = 160;
  private static final long DRAG_UPDATE_INTERVAL_MS = 16L;
  private static final long HAPTIC_MIN_INTERVAL_MS = 160L;

  private static OverlayService instance;

  private WindowManager windowManager;
  private FrameLayout bubbleView;
  private TextView countView;
  private LinearLayout menuView;
  private View scrimView;
  private WindowManager.LayoutParams bubbleParams;
  private WindowManager.LayoutParams menuParams;
  private WindowManager.LayoutParams scrimParams;
  private boolean expanded;
  private long lastHapticAtMs;

  public static OverlayService getInstance() {
    return instance;
  }

  public static void updateCount(int count) {
    if (instance != null) {
      instance.setCount(count);
    }
  }

  @Override
  public void onCreate() {
    super.onCreate();
    instance = this;
    windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
    createOverlay();
    startForeground(NOTIFICATION_ID, createNotification());
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent != null && ACTION_STOP_OVERLAY.equals(intent.getAction())) {
      stopSelf();
      return START_NOT_STICKY;
    }
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    stopForeground(true);
    collapseMenu();
    removeViewIfAttached(menuView);
    removeViewIfAttached(scrimView);
    removeViewIfAttached(bubbleView);
    bubbleView = null;
    countView = null;
    menuView = null;
    scrimView = null;
    instance = null;
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
    SharedPreferences preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
    bubbleParams.x = preferences.getInt(KEY_BUBBLE_X, dpToPx(16));
    bubbleParams.y = preferences.getInt(KEY_BUBBLE_Y, dpToPx(120));
    clampBubblePosition(size);
    bubbleView.setOnTouchListener(new BubbleTouchListener());

    if (isViewAttached(bubbleView)) {
      return;
    }

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
    if (expanded) {
      return;
    }

    expanded = true;
    addScrim();
    ensureMenuView();

    if (isViewAttached(menuView)) {
      return;
    }

    if (menuParams == null) {
      menuParams = new WindowManager.LayoutParams(
        dpToPx(220),
        WindowManager.LayoutParams.WRAP_CONTENT,
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
          ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
          : WindowManager.LayoutParams.TYPE_PHONE,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
        PixelFormat.TRANSLUCENT
      );
    }

    menuParams.gravity = Gravity.TOP | Gravity.START;
    menuParams.x = bubbleParams.x;
    menuParams.y = Math.max(dpToPx(16), bubbleParams.y - dpToPx(260));
    clampMenuPosition();

    try {
      windowManager.addView(menuView, menuParams);
      menuView.setAlpha(0f);
      ObjectAnimator slideAnimator = ObjectAnimator.ofFloat(
        menuView,
        "translationY",
        dpToPx(MENU_OPEN_TRANSLATION_DP),
        0f
      );
      slideAnimator.setInterpolator(new DecelerateInterpolator());
      slideAnimator.setDuration(MENU_ANIMATION_DURATION_MS);
      slideAnimator.start();

      menuView.animate().alpha(1f).setDuration(MENU_ANIMATION_DURATION_MS).start();
    } catch (SecurityException | RuntimeException exception) {
      collapseMenu();
    }
  }

  private void ensureMenuView() {
    if (menuView != null) {
      return;
    }

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
  }

  private void addMenuItem(String label, String route, boolean autoRecord) {
    TextView menuItem = new TextView(this);
    menuItem.setText(label);
    menuItem.setTextColor(0xFFFFFFFF);
    menuItem.setTextSize(15f);
    menuItem.setMinHeight(dpToPx(48));
    menuItem.setPadding(dpToPx(12), dpToPx(12), dpToPx(12), dpToPx(12));
    menuItem.setGravity(Gravity.CENTER_VERTICAL);
    menuItem.setOnClickListener((ignored) -> {
      launchRoute(route, autoRecord);
      collapseMenu();
    });
    menuView.addView(menuItem);
  }

  private void addScrim() {
    if (isViewAttached(scrimView)) {
      return;
    }

    if (scrimView == null) {
      scrimView = new View(this);
      scrimView.setBackgroundColor(0x29000000);
      scrimView.setOnClickListener((ignored) -> collapseMenu());
    }

    if (scrimParams == null) {
      scrimParams = new WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
          ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
          : WindowManager.LayoutParams.TYPE_PHONE,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
        PixelFormat.TRANSLUCENT
      );
    }

    scrimParams.gravity = Gravity.TOP | Gravity.START;
    try {
      windowManager.addView(scrimView, scrimParams);
      scrimView.setAlpha(0f);
      scrimView.animate().alpha(1f).setDuration(MENU_ANIMATION_DURATION_MS).start();
    } catch (SecurityException | RuntimeException ignored) {
      scrimView = null;
    }
  }

  private void collapseMenu() {
    if (!expanded) {
      return;
    }

    expanded = false;

    if (isViewAttached(menuView)) {
      menuView
        .animate()
        .alpha(0f)
        .translationY(dpToPx(8))
        .setDuration(120)
        .withEndAction(() -> {
          menuView.setTranslationY(0f);
          removeViewIfAttached(menuView);
        })
        .start();
    }

    if (isViewAttached(scrimView)) {
      scrimView
        .animate()
        .alpha(0f)
        .setDuration(120)
        .withEndAction(() -> removeViewIfAttached(scrimView))
        .start();
    }
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

  private boolean isViewAttached(View view) {
    return view != null && view.isAttachedToWindow();
  }

  private void setCount(int count) {
    SharedPreferences preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
    preferences.edit().putInt(KEY_LAST_COUNT, count).apply();
    if (countView != null) {
      countView.post(() -> countView.setText(String.valueOf(count)));
    }
  }

  private void clampBubblePosition(int bubbleSize) {
    if (bubbleParams == null) {
      return;
    }

    int margin = dpToPx(8);
    int maxX = Math.max(margin, getResources().getDisplayMetrics().widthPixels - bubbleSize - margin);
    int maxY = Math.max(margin, getResources().getDisplayMetrics().heightPixels - bubbleSize - margin);

    bubbleParams.x = Math.max(margin, Math.min(bubbleParams.x, maxX));
    bubbleParams.y = Math.max(margin, Math.min(bubbleParams.y, maxY));
  }

  private void clampMenuPosition() {
    if (menuParams == null) {
      return;
    }

    int margin = dpToPx(8);
    int menuWidth = dpToPx(220);
    int maxX = Math.max(margin, getResources().getDisplayMetrics().widthPixels - menuWidth - margin);
    int estimatedMenuHeight = dpToPx(320);
    int maxY = Math.max(margin, getResources().getDisplayMetrics().heightPixels - estimatedMenuHeight - margin);

    menuParams.x = Math.max(margin, Math.min(menuParams.x, maxX));
    menuParams.y = Math.max(margin, Math.min(menuParams.y, maxY));
  }

  private void persistBubblePosition() {
    if (bubbleParams == null) {
      return;
    }

    SharedPreferences preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
    preferences
      .edit()
      .putInt(KEY_BUBBLE_X, bubbleParams.x)
      .putInt(KEY_BUBBLE_Y, bubbleParams.y)
      .apply();
  }

  private void snapBubbleToNearestEdge() {
    if (bubbleParams == null) {
      return;
    }

    int width = getResources().getDisplayMetrics().widthPixels;
    int bubbleWidth = bubbleView != null && bubbleView.getWidth() > 0 ? bubbleView.getWidth() : dpToPx(56);
    int margin = dpToPx(8);
    int leftEdge = margin;
    int rightEdge = Math.max(margin, width - bubbleWidth - margin);
    int center = bubbleParams.x + (bubbleWidth / 2);

    int targetX = center < width / 2 ? leftEdge : rightEdge;
    animateBubbleToX(targetX);
  }

  private void animateBubbleToX(int targetX) {
    if (bubbleParams == null || bubbleView == null || !isViewAttached(bubbleView)) {
      return;
    }

    ValueAnimator animator = ValueAnimator.ofInt(bubbleParams.x, targetX);
    animator.setDuration(140);
    animator.setInterpolator(new DecelerateInterpolator());
    animator.addUpdateListener((valueAnimator) -> {
      bubbleParams.x = (int) valueAnimator.getAnimatedValue();
      windowManager.updateViewLayout(bubbleView, bubbleParams);
    });
    animator.addListener(new AnimatorListenerAdapter() {
      @Override
      public void onAnimationEnd(android.animation.Animator animation) {
        persistBubblePosition();
      }
    });
    animator.start();
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

    Intent stopIntent = new Intent(this, OverlayService.class);
    stopIntent.setAction(ACTION_STOP_OVERLAY);
    PendingIntent stopPendingIntent = PendingIntent.getService(
      this,
      0,
      stopIntent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );

    return new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Spark tasks")
      .setContentText("Bubble is running")
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .setOngoing(true)
      .addAction(0, "Stop", stopPendingIntent)
      .build();
  }

  private int dpToPx(int dp) {
    float density = getResources().getDisplayMetrics().density;
    return Math.round(dp * density);
  }

  /**
   * Trigger haptic feedback for touch interactions
   * Uses the device's vibrator with appropriate effect based on Android version
   */
  private void performHapticFeedback() {
    long now = System.currentTimeMillis();
    if (now - lastHapticAtMs < HAPTIC_MIN_INTERVAL_MS) {
      return;
    }
    lastHapticAtMs = now;
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        VibratorManager vibratorManager = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
        if (vibratorManager != null) {
          Vibrator vibrator = vibratorManager.getDefaultVibrator();
          if (vibrator != null && vibrator.hasVibrator()) {
            // Use amplitude for finer control on Android 12+
            vibrator.vibrate(VibrationEffect.createOneShot(8, VibrationEffect.DEFAULT_AMPLITUDE));
          }
        }
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        @SuppressWarnings("deprecation")
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
          vibrator.vibrate(VibrationEffect.createOneShot(8, VibrationEffect.DEFAULT_AMPLITUDE));
        }
      } else {
        @SuppressWarnings("deprecation")
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
          vibrator.vibrate(8);
        }
      }
    } catch (Exception ignored) {
      // Silently fail if haptics not available
    }
  }

  /**
   * Trigger heavier haptic for menu expansion
   */
  private void performMenuHapticFeedback() {
    long now = System.currentTimeMillis();
    if (now - lastHapticAtMs < HAPTIC_MIN_INTERVAL_MS) {
      return;
    }
    lastHapticAtMs = now;
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        VibratorManager vibratorManager = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
        if (vibratorManager != null) {
          Vibrator vibrator = vibratorManager.getDefaultVibrator();
          if (vibrator != null && vibrator.hasVibrator()) {
            vibrator.vibrate(VibrationEffect.createOneShot(15, VibrationEffect.DEFAULT_AMPLITUDE));
          }
        }
      } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        @SuppressWarnings("deprecation")
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
          vibrator.vibrate(VibrationEffect.createOneShot(15, VibrationEffect.DEFAULT_AMPLITUDE));
        }
      } else {
        @SuppressWarnings("deprecation")
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
          vibrator.vibrate(15);
        }
      }
    } catch (Exception ignored) {
      // Silently fail if haptics not available
    }
  }

  private class BubbleTouchListener implements View.OnTouchListener {
    private int initialX;
    private int initialY;
    private float initialTouchX;
    private float initialTouchY;
    private boolean moved;
    private long lastDragUpdateAtMs;

    @Override
    public boolean onTouch(View view, MotionEvent event) {
      switch (event.getAction()) {
        case MotionEvent.ACTION_DOWN:
          moved = false;
          lastDragUpdateAtMs = 0L;
          initialX = bubbleParams.x;
          initialY = bubbleParams.y;
          initialTouchX = event.getRawX();
          initialTouchY = event.getRawY();
          performHapticFeedback(); // Light haptic on touch down
          return true;
        case MotionEvent.ACTION_MOVE:
          long now = System.currentTimeMillis();
          if (now - lastDragUpdateAtMs < DRAG_UPDATE_INTERVAL_MS) {
            return true;
          }
          lastDragUpdateAtMs = now;
          bubbleParams.x = initialX + (int) (event.getRawX() - initialTouchX);
          bubbleParams.y = initialY + (int) (event.getRawY() - initialTouchY);
          int bubbleSize = bubbleView != null && bubbleView.getWidth() > 0 ? bubbleView.getWidth() : dpToPx(56);
          clampBubblePosition(bubbleSize);
          windowManager.updateViewLayout(bubbleView, bubbleParams);
          int dragThreshold = dpToPx(DRAG_THRESHOLD_DP);
          if (
            Math.abs(event.getRawX() - initialTouchX) > dragThreshold ||
            Math.abs(event.getRawY() - initialTouchY) > dragThreshold
          ) {
            moved = true;
          }
          return true;
        case MotionEvent.ACTION_UP:
          if (!moved) {
            performMenuHapticFeedback(); // Heavier haptic on tap
            toggleExpanded();
          } else {
            snapBubbleToNearestEdge();
          }
          return true;
        case MotionEvent.ACTION_CANCEL:
          if (moved) {
            persistBubblePosition();
          }
          return true;
        default:
          return false;
      }
    }
  }
}
