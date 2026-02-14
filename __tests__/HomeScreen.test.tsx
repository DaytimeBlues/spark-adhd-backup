import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../src/screens/HomeScreen';

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
    addEventListener: jest.fn().mockReturnValue(() => {}),
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
});
