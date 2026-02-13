import AISortService from '../src/services/AISortService';

jest.mock('../src/config', () => ({
  config: {
    apiBaseUrl: 'https://spark-adhd-api.vercel.app',
  },
}));

describe('AISortService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('returns [] for empty input', async () => {
    const result = await AISortService.sortItems([]);
    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns sorted items when api succeeds', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        sorted: [
          { text: 'Book dentist', category: 'task', priority: 'high' },
          { text: 'Lunch Friday', category: 'event', priority: 'medium' },
        ],
      }),
    });

    const result = await AISortService.sortItems(['Book dentist']);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { text: 'Book dentist', category: 'task', priority: 'high' },
      { text: 'Lunch Friday', category: 'event', priority: 'medium' },
    ]);
  });

  it('throws when api returns malformed payload', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ sorted: [{ nope: true }] }),
    });

    await expect(AISortService.sortItems(['x'])).rejects.toThrow(
      'Invalid AI sort response schema.',
    );
  });

  it('throws with server error message', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Rate limit exceeded' }),
    });

    await expect(AISortService.sortItems(['x'])).rejects.toThrow(
      'Rate limit exceeded',
    );
  });
});
