import { Platform, Vibration } from 'react-native';

const TAP_DURATION_MS = 8;
const MIN_INTERVAL_MS = 100;

type TapOptions = {
  key?: string;
  minIntervalMs?: number;
  durationMs?: number;
};

class HapticsService {
  private lastTapAtByKey: Record<string, number> = {};

  tap(options?: TapOptions): void {
    if (Platform.OS === 'web') {
      return;
    }

    const key = options?.key ?? 'global';
    const minIntervalMs = options?.minIntervalMs ?? MIN_INTERVAL_MS;
    const durationMs = options?.durationMs ?? TAP_DURATION_MS;
    const now = Date.now();
    const lastTapAt = this.lastTapAtByKey[key] ?? 0;

    if (now - lastTapAt < minIntervalMs) {
      return;
    }

    this.lastTapAtByKey[key] = now;
    Vibration.vibrate(durationMs);
  }
}

export default new HapticsService();
