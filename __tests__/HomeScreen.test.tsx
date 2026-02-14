import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Platform, Share } from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';

const overlayListeners: Record<string, (() => void)[]> = {};

const emitOverlayEvent = (eventName: string) => {
  (overlayListeners[eventName] || []).forEach((listener) => listener());
};

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    STORAGE_KEYS: {
      streakCount: 'streakCount',
    },
  },
}));

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('../src/services/OverlayService', () => ({
  __esModule: true,
  default: {
    canDrawOverlays: jest.fn().mockResolvedValue(false),
    requestOverlayPermission: jest.fn().mockResolvedValue(false),
    startOverlay: jest.fn(),
    stopOverlay: jest.fn(),
    updateCount: jest.fn(),
    addEventListener: jest.fn(
      (eventName: string, listener: () => void | { granted?: boolean }) => {
        if (!overlayListeners[eventName]) {
          overlayListeners[eventName] = [];
        }
        overlayListeners[eventName].push(listener as () => void);
        return () => {
          overlayListeners[eventName] = (
            overlayListeners[eventName] || []
          ).filter((candidate) => candidate !== listener);
        };
      },
    ),
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('HomeScreen', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Share, 'share').mockResolvedValue({
      action: 'sharedAction',
      activityType: null,
    });
    Object.keys(overlayListeners).forEach((key) => {
      delete overlayListeners[key];
    });
  });

  const renderHomeScreen = () => {
    const result = render(<HomeScreen navigation={mockNavigation} />);
    act(() => {
      jest.runOnlyPendingTimers();
    });
    return result;
  };

  it('renders correctly', () => {
    renderHomeScreen();
    expect(screen.getByText('SPARK')).toBeTruthy();
  });

  it('displays mode cards', () => {
    renderHomeScreen();
    expect(screen.getByText('IGNITE')).toBeTruthy();
    expect(screen.getByText('FOG CUTTER')).toBeTruthy();
    expect(screen.getByText('POMODORO')).toBeTruthy();
    expect(screen.getByText('CBT GUIDE')).toBeTruthy();
  });

  it('shows streak container', () => {
    renderHomeScreen();
    expect(screen.getByText(/0\s+days?/i)).toBeTruthy();
  });

  it('navigates to FogCutter when its card is pressed', () => {
    renderHomeScreen();
    fireEvent.press(screen.getByTestId('mode-fogcutter'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FogCutter');
  });

  it('renders overlay debug log entries when permission event is received', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });

    renderHomeScreen();

    await act(async () => {
      emitOverlayEvent('overlay_permission_requested');
    });

    expect(screen.getByText('OVERLAY EVENT LOG (DEV)')).toBeTruthy();
    expect(screen.getByText(/Permission requested/i)).toBeTruthy();

    fireEvent.press(screen.getByText('COPY DIAGNOSTICS'));
    expect(Share.share).toHaveBeenCalled();
  });
});
