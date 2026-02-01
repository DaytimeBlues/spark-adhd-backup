import { NativeModules, Platform } from "react-native";

const { OverlayModule } = NativeModules as {
  OverlayModule?: {
    startOverlay: () => void;
    stopOverlay: () => void;
    updateCount: (count: number) => void;
    canDrawOverlays: () => Promise<boolean>;
    requestOverlayPermission: () => Promise<boolean>;
  };
};

const OverlayService = {
  async canDrawOverlays(): Promise<boolean> {
    if (Platform.OS !== "android") {
      return false;
    }
    if (!OverlayModule?.canDrawOverlays) {
      return false;
    }
    return OverlayModule.canDrawOverlays();
  },

  async requestOverlayPermission(): Promise<boolean> {
    if (Platform.OS !== "android") {
      return false;
    }
    if (!OverlayModule?.requestOverlayPermission) {
      return false;
    }
    return OverlayModule.requestOverlayPermission();
  },

  startOverlay() {
    if (Platform.OS !== "android") {
      return;
    }
    OverlayModule?.startOverlay?.();
  },

  stopOverlay() {
    if (Platform.OS !== "android") {
      return;
    }
    OverlayModule?.stopOverlay?.();
  },

  updateCount(count: number) {
    if (Platform.OS !== "android") {
      return;
    }
    OverlayModule?.updateCount?.(count);
  },
};

export default OverlayService;
