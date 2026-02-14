import { NativeModules, Platform } from 'react-native';

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
    } catch {
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
    try {
      return await OverlayModule.requestOverlayPermission();
    } catch {
      return false;
    }
  },

  startOverlay() {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      OverlayModule?.startOverlay?.();
    } catch {
      // no-op
    }
  },

  stopOverlay() {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      OverlayModule?.stopOverlay?.();
    } catch {
      // no-op
    }
  },

  updateCount(count: number) {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      OverlayModule?.updateCount?.(count);
    } catch {
      // no-op
    }
  },

  collapseOverlay() {
    if (Platform.OS !== 'android') {
      return;
    }
    try {
      OverlayModule?.collapseOverlay?.();
    } catch {
      // no-op
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
    } catch {
      return false;
    }
  },
};

export default OverlayService;
