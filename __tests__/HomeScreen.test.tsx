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

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<HomeScreen />);
    expect(screen.getByText("Spark")).toBeTruthy();
  });

  it("displays mode cards", () => {
    render(<HomeScreen />);
    expect(screen.getByText("Ignite")).toBeTruthy();
    expect(screen.getByText("Fog Cutter")).toBeTruthy();
    expect(screen.getByText("Pomodoro")).toBeTruthy();
    expect(screen.getByText("CBT Guide")).toBeTruthy();
  });

  it("shows streak container", () => {
    render(<HomeScreen />);
    expect(screen.getByText(/0 days? streak/i)).toBeTruthy();
  });
});
