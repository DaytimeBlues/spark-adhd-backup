type OverlayServiceModule = typeof import('../src/services/OverlayService');

const mockOverlayModule = {
  startOverlay: jest.fn(),
  stopOverlay: jest.fn(),
  updateCount: jest.fn(),
  canDrawOverlays: jest.fn().mockResolvedValue(false),
  requestOverlayPermission: jest.fn(),
  collapseOverlay: jest.fn(),
  isExpanded: jest.fn().mockResolvedValue(false),
};

const mockListeners: Record<string, Array<(payload?: unknown) => void>> = {};

const loadOverlayService = (): OverlayServiceModule => {
  jest.resetModules();
  Object.keys(mockListeners).forEach((key) => {
    delete mockListeners[key];
  });

  jest.doMock('react-native', () => {
    class MockNativeEventEmitter {
      addListener(eventName: string, listener: (payload?: unknown) => void) {
        if (!mockListeners[eventName]) {
          mockListeners[eventName] = [];
        }
        mockListeners[eventName].push(listener);
        return {
          remove: () => {
            mockListeners[eventName] = (mockListeners[eventName] || []).filter(
              (candidate) => candidate !== listener,
            );
          },
        };
      }
    }

    return {
      NativeModules: {
        OverlayModule: mockOverlayModule,
      },
      NativeEventEmitter: MockNativeEventEmitter,
      Platform: {
        OS: 'android',
      },
      __emitOverlayEvent: (eventName: string, payload?: unknown) => {
        (mockListeners[eventName] || []).forEach((listener) =>
          listener(payload),
        );
      },
    };
  });

  return require('../src/services/OverlayService');
};

describe('OverlayService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns false when permission request times out', async () => {
    const { default: OverlayService } = loadOverlayService();
    mockOverlayModule.requestOverlayPermission.mockRejectedValueOnce(
      new Error('E_OVERLAY_PERMISSION_TIMEOUT'),
    );

    const granted = await OverlayService.requestOverlayPermission();

    expect(granted).toBe(false);
    expect(mockOverlayModule.requestOverlayPermission).toHaveBeenCalledTimes(1);
  });

  it('clears pending count updates when overlay is stopped', () => {
    const { default: OverlayService } = loadOverlayService();
    jest.useFakeTimers();

    OverlayService.updateCount(5);
    OverlayService.stopOverlay();

    jest.runOnlyPendingTimers();

    expect(mockOverlayModule.stopOverlay).toHaveBeenCalledTimes(1);
    expect(mockOverlayModule.updateCount).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('subscribes and unsubscribes overlay permission timeout events', () => {
    const { default: OverlayService, OVERLAY_EVENTS } = loadOverlayService();
    const listener = jest.fn();
    const unsubscribe = OverlayService.addEventListener(
      OVERLAY_EVENTS.permissionTimeout,
      listener,
    );
    const reactNative = require('react-native') as {
      __emitOverlayEvent: (eventName: string, payload?: unknown) => void;
    };

    reactNative.__emitOverlayEvent(OVERLAY_EVENTS.permissionTimeout);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe?.();
    reactNative.__emitOverlayEvent(OVERLAY_EVENTS.permissionTimeout);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
