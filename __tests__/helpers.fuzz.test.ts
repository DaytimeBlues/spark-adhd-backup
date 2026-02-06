import { formatTime } from "../src/utils/helpers";

describe("helpers fuzz tests", () => {
  it("formatTime handles random non-negative values", () => {
    const samples = Array.from({ length: 250 }, () =>
      Math.floor(Math.random() * 100000),
    );

    samples.forEach((value) => {
      const result = formatTime(value);
      expect(result).toMatch(/^\d{2,}:\d{2}$/);

      const [mins, secs] = result.split(":").map((chunk) => Number(chunk));
      expect(Number.isNaN(mins)).toBe(false);
      expect(Number.isNaN(secs)).toBe(false);
      expect(secs).toBeGreaterThanOrEqual(0);
      expect(secs).toBeLessThan(60);
    });
  });
});
