import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

const { OverlayModule } = NativeModules as {
  OverlayModule?: {
    startOverlay: () => void;
    stopOverlay: () => void;
    updateCount: (count: number) => void;
    canDrawOverlays: () => Promise<boolean>;
    requestOverlayPermission: () => Promise<boolean>;
    collapseOverlay?: () => void;
    isExpanded?: () => Promise<boolean>;
  };
};

export const OVERLAY_EVENTS = {
  started: 'overlay_started',
  stopped: 'overlay_stopped',
  permissionRequested: 'overlay_permission_requested',
  permissionResult: 'overlay_permission_result',
  permissionTimeout: 'overlay_permission_timeout',
  permissionError: 'overlay_permission_error',
} as const;

export type OverlayEventName =
  (typeof OVERLAY_EVENTS)[keyof typeof OVERLAY_EVENTS];

export type OverlayEventPayload = {
  granted?: boolean;
};

const overlayEventEmitter = OverlayModule
  ? new NativeEventEmitter(OverlayModule)
  : null;

let pendingOverlayCount = 0;
let overlayCountUpdateTimer: ReturnType<typeof setTimeout> | null = null;
const OVERLAY_COUNT_DEBOUNCE_MS = 180;
let overlayPermissionRequestInProgress = false;

const flushOverlayCount = () => {
  if (!OverlayModule?.updateCount) {
    return;
  }
  try {
    OverlayModule.updateCount(pendingOverlayCount);
  } catch (error) {
    console.warn('OverlayService.updateCount failed:', error);
  }
};

const OverlayService = {
  async canDrawOverlays(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    if (!OverlayModule?.canDrawOverlays) {
      return false;
    }
    try {
      return await OverlayModule.canDrawOverlays();
    } catch (error) {
      console.warn('OverlayService.canDrawOverlays failed:', error);
      return false;
    }
  },

  async requestOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    if (!OverlayModule?.requestOverlayPermission) {
      return false;
    }
    if (overlayPermissionRequestInProgress) {
      return false;
    }
    overlayPermissionRequestInProgress = true;
    try {
      return await OverlayModule.requestOverlayPermission();
    } catch (error) {
      console.warn('OverlayService.requestOverlayPermission failed:', error);
      return false;
    } finally {
      overlayPermissionRequestInProgress = false;
    }
  },

  startOverlay() {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      if (overlayCountUpdateTimer) {
        clearTimeout(overlayCountUpdateTimer);
        overlayCountUpdateTimer = null;
      }
      flushOverlayCount();
      OverlayModule?.startOverlay?.();
    } catch (error) {
      console.warn('OverlayService.startOverlay failed:', error);
    }
  },

  stopOverlay() {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      if (overlayCountUpdateTimer) {
        clearTimeout(overlayCountUpdateTimer);
        overlayCountUpdateTimer = null;
      }
      OverlayModule?.stopOverlay?.();
    } catch (error) {
      console.warn('OverlayService.stopOverlay failed:', error);
    }
  },

  updateCount(count: number) {
    if (Platform.OS !== 'android') {
      return;
    }
    const normalizedCount = Number.isFinite(count)
      ? Math.max(0, Math.floor(count))
      : 0;
    pendingOverlayCount = normalizedCount;
    if (overlayCountUpdateTimer) {
      return;
    }

    overlayCountUpdateTimer = setTimeout(() => {
      overlayCountUpdateTimer = null;
      flushOverlayCount();
    }, OVERLAY_COUNT_DEBOUNCE_MS);
  },

  flushOverlayCount() {
    if (Platform.OS !== 'android') {
      return;
    }
    if (overlayCountUpdateTimer) {
      clearTimeout(overlayCountUpdateTimer);
      overlayCountUpdateTimer = null;
    }
    flushOverlayCount();
  },

  isPermissionRequestInProgress() {
    return overlayPermissionRequestInProgress;
  },

  addEventListener(
    eventName: OverlayEventName,
    listener: (payload: OverlayEventPayload) => void,
  ): (() => void) | null {
    if (!overlayEventEmitter) {
      return null;
    }

    const subscription: EmitterSubscription = overlayEventEmitter.addListener(
      eventName,
      listener,
    );

    return () => {
      subscription.remove();
    };
  },

  collapseOverlay() {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      OverlayModule?.collapseOverlay?.();
    } catch (error) {
      console.warn('OverlayService.collapseOverlay failed:', error);
    }
  },

  async isExpanded(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }
    if (!OverlayModule?.isExpanded) {
      return false;
    }
    try {
      return await OverlayModule.isExpanded();
    } catch (error) {
      console.warn('OverlayService.isExpanded failed:', error);
      return false;
    }
  },
};

export default OverlayService;
