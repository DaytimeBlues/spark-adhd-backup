import React from "react";
import { render, screen } from "@testing-library/react-native";
import FogCutterScreen from "../src/screens/FogCutterScreen";

const mockGetJSON = jest.fn();
const mockSetJSON = jest.fn();

jest.mock("../src/services/StorageService", () => ({
  __esModule: true,
  default: {
    getJSON: (...args: unknown[]) => mockGetJSON(...args),
    setJSON: (...args: unknown[]) => mockSetJSON(...args),
    STORAGE_KEYS: {
      tasks: "tasks",
    },
  },
}));

jest.mock("../src/components/ui/LinearButton", () => ({
  LinearButton: ({ title }: { title: string }) => <>{title}</>,
}));

describe("FogCutterScreen", () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockGetJSON.mockReset();
    mockSetJSON.mockReset();
  });

  it("loads tasks from storage and renders them", async () => {
    mockGetJSON.mockResolvedValue([
      {
        id: "task-1",
        text: "Draft outline",
        completed: false,
        microSteps: ["Step 1", "Step 2"],
      },
    ]);

    render(<FogCutterScreen />);

    expect(await screen.findByText("Draft outline")).toBeTruthy();
    expect(await screen.findByText("2 steps")).toBeTruthy();
  }, 15000);
});
