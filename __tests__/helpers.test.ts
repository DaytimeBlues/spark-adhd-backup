import { formatTime, calculateStreak, generateId, getDayName } from "../src/utils/helpers";
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

  describe("generateId", () => {
    it("returns unique non-empty strings", () => {
      const first = generateId();
      const second = generateId();

      expect(typeof first).toBe("string");
      expect(typeof second).toBe("string");
      expect(first).not.toEqual("");
      expect(second).not.toEqual("");
      expect(first).not.toEqual(second);
    });
  });

  describe("getDayName", () => {
    it("returns the correct day name", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      expect(getDayName(date)).toBe("Monday");
    });
  });
});
