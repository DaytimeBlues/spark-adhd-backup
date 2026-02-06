import { render, screen } from "@testing-library/react-native";
import React from "react";
import HomeScreen from "../src/screens/HomeScreen";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<HomeScreen navigation={mockNavigation} />);
    expect(screen.getByText("Spark")).toBeTruthy();
  });

  it("displays mode cards", () => {
    render(<HomeScreen navigation={mockNavigation} />);
    expect(screen.getByText("Ignite")).toBeTruthy();
    expect(screen.getByText("Fog Cutter")).toBeTruthy();
    expect(screen.getByText("Pomodoro")).toBeTruthy();
    expect(screen.getByText("CBT Guide")).toBeTruthy();
  });

  it("shows streak container", () => {
    render(<HomeScreen navigation={mockNavigation} />);
    expect(screen.getByText(/0 days? streak/i)).toBeTruthy();
  });
});
