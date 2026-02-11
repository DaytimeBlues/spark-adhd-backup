import { render, screen } from '@testing-library/react-native';
import React from 'react';
import CBTGuideScreen from '../src/screens/CBTGuideScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

describe('CBTGuideScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title', () => {
    render(<CBTGuideScreen navigation={mockNavigation} />);
    expect(screen.getByText('CBT for ADHD')).toBeTruthy();
    expect(screen.getByText('Evidence-based strategies')).toBeTruthy();
  });

  it('displays CADDI pillars', () => {
    render(<CBTGuideScreen navigation={mockNavigation} />);
    expect(screen.getByText('Behavioral Activation')).toBeTruthy();
    expect(screen.getByText('Organization')).toBeTruthy();
    expect(screen.getByText('Mindfulness')).toBeTruthy();
  });

  it('shows feature buttons', () => {
    render(<CBTGuideScreen navigation={mockNavigation} />);
    expect(screen.getByText('Ignite Timer')).toBeTruthy();
    expect(screen.getByText('Pomodoro')).toBeTruthy();
    expect(screen.getByText('Fog Cutter')).toBeTruthy();
    expect(screen.getByText('Brain Dump')).toBeTruthy();
    expect(screen.getByText('Anchor Breathing')).toBeTruthy();
  });

  it('renders intro card about CADDI', () => {
    render(<CBTGuideScreen navigation={mockNavigation} />);
    expect(screen.getByText(/About CADDI/i)).toBeTruthy();
    expect(
      screen.getByText(/Behavioral Activation, Organization, and Mindfulness/i),
    ).toBeTruthy();
  });
});
