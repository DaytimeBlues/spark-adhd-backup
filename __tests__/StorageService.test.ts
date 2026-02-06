import AsyncStorage from "@react-native-async-storage/async-storage";
import StorageService from "../src/services/StorageService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

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

  it("getJSON returns null when storage is empty", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await StorageService.getJSON("empty-key");
    expect(result).toBeNull();
  });

  it("getJSON returns null for invalid JSON", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("{not-json");

    const result = await StorageService.getJSON("test-key");
    expect(result).toBeNull();
  });

  it("get returns null on storage error", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error("fail"),
    );

    const result = await StorageService.get("test-key");
    expect(result).toBeNull();
  });

  it("set returns false on storage error", async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error("fail"),
    );

    const result = await StorageService.set("test-key", "value");
    expect(result).toBe(false);
  });

  it("remove returns false on storage error", async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
      new Error("fail"),
    );

    const result = await StorageService.remove("test-key");
    expect(result).toBe(false);
  });

  it("remove returns true on success", async () => {
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await StorageService.remove("test-key");
    expect(result).toBe(true);
  });

  it("setJSON returns false when JSON serialization fails", async () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    const result = await StorageService.setJSON("test-key", circular);
    expect(result).toBe(false);
  });
});
