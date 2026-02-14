import { Platform, Vibration } from 'react-native';

// Detect if device has haptic engine (iOS 10+)
const hasHapticEngine = Platform.OS === 'ios';

// Light tap for UI feedback
const LIGHT_TAP_MS = 10;
const MEDIUM_TAP_MS = 20;
const HEAVY_TAP_MS = 40;
const MIN_INTERVAL_MS = 100;

// Selection feedback (iOS only - subtle tick)
const SELECTION_INTERVAL_MS = 50;

type TapOptions = {
  key?: string;
  minIntervalMs?: number;
  durationMs?: number;
  intensity?: 'light' | 'medium' | 'heavy';
};

type SelectionOptions = {
  key?: string;
};

class HapticsService {
  private lastTapByKey: Record<string, number> = {};
  private lastSelectionByKey: Record<string, number> = {};

  /**
   * Light tap - for button presses, selections
   * Uses native haptic on iOS, vibration on Android
   */
  tap(options?: TapOptions): void {
    if (Platform.OS === 'web') {
      return;
    }

    const key = options?.key ?? 'global';
    const minIntervalMs = options?.minIntervalMs ?? MIN_INTERVAL_MS;
    const intensity = options?.intensity ?? 'light';
    const now = Date.now();
    const lastTapAt = this.lastTapByKey[key] ?? 0;

    if (now - lastTapAt < minIntervalMs) {
      return;
    }

    this.lastTapByKey[key] = now;

    if (hasHapticEngine) {
      // iOS uses native haptics - these are much better than vibration
      // Intensity is handled by the OS through different impact types
      // For now, we use a simple vibration as fallback
      // In production, you'd use expo-haptics or react-native-haptics
      Vibration.vibrate(
        intensity === 'heavy'
          ? HEAVY_TAP_MS
          : intensity === 'medium'
            ? MEDIUM_TAP_MS
            : LIGHT_TAP_MS,
      );
    } else {
      // Android - use vibration with intensity
      Vibration.vibrate(
        intensity === 'heavy'
          ? HEAVY_TAP_MS
          : intensity === 'medium'
            ? MEDIUM_TAP_MS
            : LIGHT_TAP_MS,
      );
    }
  }

  /**
   * Medium tap - for important actions
   */
  mediumTap(options?: TapOptions): void {
    this.tap({ ...options, intensity: 'medium' });
  }

  /**
   * Heavy tap - for critical actions, completion
   */
  heavyTap(options?: TapOptions): void {
    this.tap({ ...options, intensity: 'heavy' });
  }

  /**
   * Selection feedback - subtle tick for scrolling/selection changes
   * iOS only - very subtle
   */
  selection(options?: SelectionOptions): void {
    if (Platform.OS === 'web') {
      return;
    }

    const key = options?.key ?? 'global';
    const now = Date.now();
    const lastSelectionAt = this.lastSelectionByKey[key] ?? 0;

    if (now - lastSelectionAt < SELECTION_INTERVAL_MS) {
      return;
    }

    this.lastSelectionByKey[key] = now;

    // Light tick for selection
    Vibration.vibrate(5);
  }

  /**
   * Success feedback - double vibration pattern
   */
  success(): void {
    if (Platform.OS === 'web') {
      return;
    }
    Vibration.vibrate([0, 50, 50, 50]);
  }

  /**
   * Warning feedback - longer vibration
   */
  warning(): void {
    if (Platform.OS === 'web') {
      return;
    }
    Vibration.vibrate(100);
  }

  /**
   * Error feedback - triple short vibration
   */
  error(): void {
    if (Platform.OS === 'web') {
      return;
    }
    Vibration.vibrate([0, 30, 30, 30, 30, 30]);
  }

  /**
   * Cancel/restore feedback - sequence
   */
  cancel(): void {
    if (Platform.OS === 'web') {
      return;
    }
    Vibration.vibrate([0, 20, 50, 20]);
  }
}

export default new HapticsService();
