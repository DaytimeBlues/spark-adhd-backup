import { Platform } from 'react-native';
import PlaudService from '../src/services/PlaudService';

// Mock fetch
// @ts-ignore
global.fetch = jest.fn();

// Mock Platform more deeply
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios', // Default
  select: jest.fn(
    (dict: { ios?: unknown; default?: unknown }) => dict.ios || dict.default,
  ),
}));

describe('PlaudService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PlaudService.setApiUrl('https://test-api.vercel.app');
    (fetch as jest.Mock).mockReset();
  });

  describe('transcribe', () => {
    it('should handle successful transcription on Web', async () => {
      // Mock web platform
      // @ts-ignore
      Platform.OS = 'web';
      // @ts-ignore
      Platform.select.mockImplementation((dict) => dict.web || dict.default);

      const mockBlob = { size: 1024, type: 'audio/m4a' };
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: jest.fn().mockResolvedValue(mockBlob),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            success: true,
            transcription: 'Hello world',
            summary: 'Greeting',
          }),
        });

      const result = await PlaudService.transcribe('blob:test-uri');

      expect(result.success).toBe(true);
      expect(result.transcription).toBe('Hello world');
    });

    it('should handle successful transcription on Native', async () => {
      // Mock native platform
      // @ts-ignore
      Platform.OS = 'ios';
      // @ts-ignore
      Platform.select.mockImplementation((dict) => dict.ios || dict.default);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          transcription: 'Native world',
        }),
      });

      const result = await PlaudService.transcribe('file://test-path.m4a');

      expect(result.success).toBe(true);
      expect(result.transcription).toBe('Native world');
    });

    it('should handle API error responses', async () => {
      // @ts-ignore
      Platform.OS = 'ios';

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
      });

      const result = await PlaudService.transcribe('file://test.m4a');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server Error');
    });

    it('should handle network exceptions', async () => {
      // @ts-ignore
      Platform.OS = 'ios';
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Fail'));

      const result = await PlaudService.transcribe('file://test.m4a');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network Fail');
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is reachable', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const result = await PlaudService.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when API is unreachable', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Down'));

      const result = await PlaudService.healthCheck();
      expect(result).toBe(false);
    });
  });
});
