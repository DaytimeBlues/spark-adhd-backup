package com.sparkadhd;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.TextView;

import androidx.core.app.NotificationCompat;

public class OverlayService extends Service {
  private static final String CHANNEL_ID = "spark_overlay";
  private static final int NOTIFICATION_ID = 1001;
  private static OverlayService instance;

  private WindowManager windowManager;
  private FrameLayout bubbleView;
  private TextView countView;

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
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    if (bubbleView != null) {
      windowManager.removeView(bubbleView);
      bubbleView = null;
    }
    instance = null;
  }

  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private void createOverlay() {
    bubbleView = new FrameLayout(this);
    int size = dpToPx(56);
    FrameLayout.LayoutParams bubbleLayout = new FrameLayout.LayoutParams(size, size);
    bubbleLayout.gravity = Gravity.CENTER;

    countView = new TextView(this);
    countView.setText("0");
    countView.setTextColor(0xFFFFFFFF);
    countView.setTextSize(16f);
    countView.setGravity(Gravity.CENTER);

    GradientDrawable background = new GradientDrawable();
    background.setColor(0xFF2D89EF);
    background.setCornerRadius(size / 2f);
    bubbleView.setBackground(background);
    bubbleView.addView(countView, bubbleLayout);

    final WindowManager.LayoutParams params = new WindowManager.LayoutParams(
      WindowManager.LayoutParams.WRAP_CONTENT,
      WindowManager.LayoutParams.WRAP_CONTENT,
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        : WindowManager.LayoutParams.TYPE_PHONE,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT
    );
    params.gravity = Gravity.TOP | Gravity.START;
    params.x = dpToPx(16);
    params.y = dpToPx(120);

    bubbleView.setOnTouchListener(new View.OnTouchListener() {
      private int initialX;
      private int initialY;
      private float initialTouchX;
      private float initialTouchY;

      @Override
      public boolean onTouch(View v, MotionEvent event) {
        switch (event.getAction()) {
          case MotionEvent.ACTION_DOWN:
            initialX = params.x;
            initialY = params.y;
            initialTouchX = event.getRawX();
            initialTouchY = event.getRawY();
            return true;
          case MotionEvent.ACTION_MOVE:
            params.x = initialX + (int) (event.getRawX() - initialTouchX);
            params.y = initialY + (int) (event.getRawY() - initialTouchY);
            windowManager.updateViewLayout(bubbleView, params);
            return true;
          case MotionEvent.ACTION_UP:
            if (Math.abs(event.getRawX() - initialTouchX) < 10
              && Math.abs(event.getRawY() - initialTouchY) < 10) {
              Intent launchIntent = new Intent(getApplicationContext(), MainActivity.class);
              launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
              startActivity(launchIntent);
            }
            return true;
          default:
            return false;
        }
      }
    });

    windowManager.addView(bubbleView, params);
  }

  private void setCount(int count) {
    if (countView != null) {
      countView.setText(String.valueOf(count));
    }
  }

  private Notification createNotification() {
    NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
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
      .setSmallIcon(R.mipmap.ic_launcher)
      .setOngoing(true)
      .build();
  }

  private int dpToPx(int dp) {
    float density = getResources().getDisplayMetrics().density;
    return Math.round(dp * density);
  }
}
