import StorageService from './StorageService';

const MAX_EVENTS = 200;

export type UXMetricEvent = {
  name: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
};

const UXMetricsService = {
  async track(
    name: string,
    metadata?: Record<string, string | number | boolean>,
  ): Promise<void> {
    try {
      const existingEvents =
        (await StorageService.getJSON<UXMetricEvent[]>(
          StorageService.STORAGE_KEYS.uxMetricsEvents,
        )) ?? [];

      const nextEvents: UXMetricEvent[] = [
        {
          name,
          timestamp: new Date().toISOString(),
          ...(metadata ? { metadata } : {}),
        },
        ...existingEvents,
      ].slice(0, MAX_EVENTS);

      await StorageService.setJSON(
        StorageService.STORAGE_KEYS.uxMetricsEvents,
        nextEvents,
      );
    } catch (error) {
      console.warn('UXMetricsService.track failed:', error);
    }
  },
};

export default UXMetricsService;
