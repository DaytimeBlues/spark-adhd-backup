import { render, screen } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "../src/screens/HomeScreen";

jest.mock("../src/services/StorageService", () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    STORAGE_KEYS: {
      streakCount: "streakCount",
    },
  },
}));

// Mock vector icons
jest.mock("react-native-vector-icons/MaterialCommunityIcons", () => "Icon");

jest.mock("../src/services/OverlayService", () => ({
  __esModule: true,
  default: {
    canDrawOverlays: jest.fn().mockResolvedValue(false),
    requestOverlayPermission: jest.fn().mockResolvedValue(false),
    startOverlay: jest.fn(),
    stopOverlay: jest.fn(),
    updateCount: jest.fn(),
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
};


describe("HomeScreen", () => {
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

  it("renders correctly", () => {
    renderHomeScreen();
    expect(screen.getByText("Spark")).toBeTruthy();
  });

  it("displays mode cards", () => {
    renderHomeScreen();
    expect(screen.getByText("Ignite")).toBeTruthy();
    expect(screen.getByText("Fog Cutter")).toBeTruthy();
    expect(screen.getByText("Pomodoro")).toBeTruthy();
    expect(screen.getByText("CBT Guide")).toBeTruthy();
  });

  it("shows streak container", () => {
    renderHomeScreen();
    expect(screen.getByText(/0 days? streak/i)).toBeTruthy();
  });
});
