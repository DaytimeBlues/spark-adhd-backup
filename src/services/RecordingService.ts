/**
 * RecordingService
 *
 * Handles audio recording for the Brain Dump feature.
 * Uses expo-av for cross-platform audio capture.
 */

export interface RecordingResult {
  uri: string;
  duration: number;
}

interface RecordingStatus {
  durationMillis?: number;
}

interface AudioRecording {
  stopAndUnloadAsync: () => Promise<void>;
  getURI: () => string | null;
  getStatusAsync: () => Promise<RecordingStatus>;
}

interface AudioModule {
  requestPermissionsAsync: () => Promise<{ status: string }>;
  setAudioModeAsync: (options: Record<string, boolean>) => Promise<void>;
  RecordingOptionsPresets?: {
    HIGH_QUALITY: unknown;
  };
  Recording: {
    createAsync: (options: unknown) => Promise<{ recording: AudioRecording }>;
    OptionsPresets: {
      HIGH_QUALITY: unknown;
    };
  };
}

const loadAudioModule = (): AudioModule | null => {
  try {
    const module = require('expo-av') as { Audio?: AudioModule };
    return module.Audio ?? null;
  } catch {
    return null;
  }
};

class RecordingServiceClass {
  private recording: AudioRecording | null = null;
  private isRecording = false;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const Audio = loadAudioModule();
      if (!Audio) {
        console.warn('Recording unavailable: expo-av is not installed');
        return false;
      }

      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<boolean> {
    if (this.isRecording) {
      console.warn('Already recording');
      return false;
    }

    try {
      const Audio = loadAudioModule();
      if (!Audio) {
        console.warn('Recording unavailable: expo-av is not installed');
        return false;
      }

      // Request permissions if not already granted
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.error('Microphone permission not granted');
        return false;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const recordingPreset =
        Audio.RecordingOptionsPresets?.HIGH_QUALITY ??
        Audio.Recording.OptionsPresets.HIGH_QUALITY;
      const { recording } = await Audio.Recording.createAsync(
        recordingPreset,
      );

      this.recording = recording;
      this.isRecording = true;

      console.log('Recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  /**
   * Stop recording and return the audio file URI
   */
  async stopRecording(): Promise<RecordingResult | null> {
    if (!this.recording || !this.isRecording) {
      console.warn('No active recording');
      return null;
    }

    try {
      const Audio = loadAudioModule();
      if (!Audio) {
        console.warn('Recording unavailable: expo-av is not installed');
        this.recording = null;
        this.isRecording = false;
        return null;
      }

      await this.recording.stopAndUnloadAsync();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();

      this.recording = null;
      this.isRecording = false;

      if (!uri) {
        console.error('No recording URI');
        return null;
      }

      console.log('Recording stopped:', uri);
      return {
        uri,
        duration: status.durationMillis || 0,
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.recording = null;
      this.isRecording = false;
      return null;
    }
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
        // Ignore errors during cancel
      }
      this.recording = null;
      this.isRecording = false;
    }
  }

  /**
   * Reset internal state (primarily for tests)
   */
  reset(): void {
    this.recording = null;
    this.isRecording = false;
  }
}

export const RecordingService = new RecordingServiceClass();
export default RecordingService;
