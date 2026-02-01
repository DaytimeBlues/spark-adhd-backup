import { formatTime, calculateStreak } from "../src/utils/helpers";
import StorageService from "../src/services/StorageService";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("helpers", () => {
  describe("formatTime", () => {
    it("formats 0 seconds correctly", () => {
      expect(formatTime(0)).toBe("00:00");
    });

    it("formats seconds under a minute correctly", () => {
      expect(formatTime(30)).toBe("00:30");
    });

    it("formats one minute correctly", () => {
      expect(formatTime(60)).toBe("01:00");
    });

    it("formats 5 minutes correctly", () => {
      expect(formatTime(300)).toBe("05:00");
    });

    it("formats 25 minutes correctly", () => {
      expect(formatTime(1500)).toBe("25:00");
    });

    it("formats 59:59 correctly", () => {
      expect(formatTime(3599)).toBe("59:59");
    });
  });

  describe("calculateStreak", () => {
    it("returns 1 when lastUseDate is null", () => {
      expect(calculateStreak(null, 0)).toBe(1);
    });

    it("returns current streak when used today", () => {
      const today = new Date();
      expect(calculateStreak(today, 10)).toBe(10);
    });

    it("increments streak when used yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(calculateStreak(yesterday, 5)).toBe(6);
    });

    it("resets streak when missed more than one day", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(calculateStreak(threeDaysAgo, 10)).toBe(1);
    });
  });

  describe("StorageService", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("setJSON stringifies values", async () => {
      const payload = { count: 2, items: ["a", "b"] };
      await StorageService.setJSON("test-key", payload);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "test-key",
        JSON.stringify(payload),
      );
    });

    it("getJSON parses values", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify({ ok: true }),
      );

      const result = await StorageService.getJSON<{ ok: boolean }>("test-key");
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("test-key");
      expect(result).toEqual({ ok: true });
    });
  });
});
