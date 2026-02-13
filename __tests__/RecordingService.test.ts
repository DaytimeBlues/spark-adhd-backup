import { RecordingService } from "../src/services/RecordingService";
import { Audio } from "expo-av";

// Mock expo-av
const mockRecording = {
    stopAndUnloadAsync: jest.fn().mockResolvedValue({}),
    getURI: jest.fn().mockReturnValue("file://audio.m4a"),
    getStatusAsync: jest.fn().mockResolvedValue({ durationMillis: 5000 }),
};

jest.mock("expo-av", () => ({
    Audio: {
        requestPermissionsAsync: jest.fn(),
        setAudioModeAsync: jest.fn().mockResolvedValue({}),
        Recording: {
            createAsync: jest.fn(),
        },
        RecordingOptionsPresets: {
            HIGH_QUALITY: {},
        },
    },
}));

describe("RecordingService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        RecordingService.reset();

        // Set default successful mocks
        (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted", granted: true });
        (Audio.Recording.createAsync as jest.Mock).mockResolvedValue({
            recording: mockRecording,
        });

    });

    describe("requestPermissions", () => {
        it("should return true when granted", async () => {
            const result = await RecordingService.requestPermissions();
            expect(result).toBe(true);
        });

        it("should return false when denied", async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied", granted: false });
            const result = await RecordingService.requestPermissions();
            expect(result).toBe(false);
        });
    });

    describe("startRecording", () => {
        it("should start recording when permissions are granted", async () => {
            const result = await RecordingService.startRecording();
            expect(result).toBe(true);
            expect(RecordingService.getIsRecording()).toBe(true);
            expect(Audio.setAudioModeAsync).toHaveBeenCalled();
        });

        it("should fail to start when permissions are denied", async () => {
            (Audio.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: "denied" });
            const result = await RecordingService.startRecording();
            expect(result).toBe(false);
            expect(RecordingService.getIsRecording()).toBe(false);
        });
    });

    describe("stopRecording", () => {
        it("should return result and reset state", async () => {
            await RecordingService.startRecording();
            const result = await RecordingService.stopRecording();

            expect(result).toEqual({
                uri: "file://audio.m4a",
                duration: 5000,
            });
            expect(RecordingService.getIsRecording()).toBe(false);
        });

        it("should return null if not recording", async () => {
            const result = await RecordingService.stopRecording();
            expect(result).toBeNull();
        });
    });

    describe("cancelRecording", () => {
        it("should reset state", async () => {
            await RecordingService.startRecording();
            await RecordingService.cancelRecording();
            expect(RecordingService.getIsRecording()).toBe(false);
        });
    });
});
