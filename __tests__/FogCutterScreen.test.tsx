import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import FogCutterScreen from "../src/screens/FogCutterScreen";

const mockGetJSON = jest.fn();
const mockSetJSON = jest.fn();

jest.mock("../src/services/StorageService", () => ({
  __esModule: true,
  default: {
    STORAGE_KEYS: {
      tasks: "tasks",
    },
    getJSON: (...args: unknown[]) => mockGetJSON(...args),
    setJSON: (...args: unknown[]) => mockSetJSON(...args),
  },
}));


describe("FogCutterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetJSON.mockResolvedValue(null);
    mockSetJSON.mockResolvedValue(true);
  });

  it("loads tasks from storage and renders them", async () => {
    mockGetJSON.mockResolvedValueOnce([
      {
        id: "task-1",
        text: "Draft outline",
        completed: false,
        microSteps: ["Step 1", "Step 2"],
      },
    ]);

    render(<FogCutterScreen />);

    await waitFor(() => {
      expect(screen.getByText("Draft outline")).toBeTruthy();
      expect(screen.getByText("2 steps")).toBeTruthy();
    });
  });
});
