import { Platform } from 'react-native';
import { config } from '../config';

/**
 * PlaudService
 *
 * Handles communication with the Spark ADHD API middleware
 * for Plaud AI transcription.
 */

export interface TranscriptionResult {
  success: boolean;
  transcription?: string;
  summary?: string;
  error?: string;
}

class PlaudServiceClass {
  private apiUrl: string;

  constructor() {
    this.apiUrl = config.apiBaseUrl;
  }

  /**
   * Set the API base URL (for testing or different environments)
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * Upload audio file and get transcription
   *
   * @param audioUri - Local URI of the audio file
   * @returns Transcription result
   */
  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    try {
      // Read audio file and create form data
      const formData = new FormData();

      // Handle different platforms
      if (Platform.OS === 'web') {
        // For web, fetch the blob
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('audio', blob);
      } else {
        // For native, use file URI directly
        formData.append('audio', {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        } as unknown as Blob);
      }

      // Send to middleware
      const response = await fetch(`${this.apiUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            errorData.error || `Request failed with status ${response.status}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        transcription: data.transcription,
        summary: data.summary,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if the Plaud API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth`, {
        method: 'POST',
      });
      // Even a 500 means the server is reachable
      return response.status !== 0;
    } catch {
      return false;
    }
  }
}

export const PlaudService = new PlaudServiceClass();
export default PlaudService;
