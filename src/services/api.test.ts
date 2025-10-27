import { apiService } from './api';
import { Character } from '../components/CharacterCard/CharacterCard.types';

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRound', () => {
    it('should return data when API call is successful', async () => {
      const mockCharacters: Character[] = [
        {
          id: 1,
          name: 'test_character_1',
          post_count: 1000,
          image_url: 'https://example.com/image1.jpg'
        },
        {
          id: 2,
          name: 'test_character_2',
          post_count: 2000,
          image_url: 'https://example.com/image2.jpg'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharacters,
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toEqual(mockCharacters);
      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/get-round');
    });

    it('should return error when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('HTTP error! status: 500');
    });

    it('should return error when response is not an array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notAnArray: true }),
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Invalid response format');
    });

    it('should return error when response array does not have exactly 2 characters', async () => {
      const mockCharacters: Character[] = [
        {
          id: 1,
          name: 'test_character_1',
          post_count: 1000,
          image_url: 'https://example.com/image1.jpg'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCharacters,
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Invalid response format - expected 2 characters');
    });

    it('should return error when fetch throws an exception', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Network error');
    });

    it('should return error for unknown error types', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Unknown error occurred');
    });
  });

  describe('getStats', () => {
    it('should return stats data when API call is successful', async () => {
      const mockStats = { totalCharacters: 5000 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      } as Response);

      const result = await apiService.getStats();

      expect(result.data).toEqual(mockStats);
      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/stats');
    });

    it('should return error when API call fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await apiService.getStats();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('HTTP error! status: 404');
    });

    it('should return error when fetch throws an exception', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await apiService.getStats();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Connection failed');
    });
  });
});
