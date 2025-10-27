import { apiService } from '../../services/api';

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRound API Integration', () => {
    it('should handle successful API response', async () => {
      const mockResponse = [
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
        json: async () => mockResponse,
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/get-round');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Network request failed');
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Invalid JSON');
    });

    it('should validate response format', async () => {
      // Test with invalid response format (not an array)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'format' }),
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Invalid response format');
    });

    it('should validate response length', async () => {
      // Test with wrong number of characters
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 1,
            name: 'single_character',
            post_count: 1000,
            image_url: 'https://example.com/image1.jpg'
          }
        ],
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Invalid response format - expected 2 characters');
    });
  });

  describe('getStats API Integration', () => {
    it('should handle successful stats response', async () => {
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

    it('should handle stats API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await apiService.getStats();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('HTTP error! status: 404');
    });
  });

  describe('API Error Handling Integration', () => {
    it('should handle timeout scenarios', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const result = await apiService.getRound();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Request timeout');
    });

    it('should handle different HTTP status codes', async () => {
      const statusCodes = [400, 401, 403, 404, 429, 500, 502, 503];
      
      for (const status of statusCodes) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
        } as Response);

        const result = await apiService.getRound();

        expect(result.data).toBeUndefined();
        expect(result.error).toBe(`HTTP error! status: ${status}`);
      }
    });

    it('should handle empty responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const result = await apiService.getRound();

      expect(result.data).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });

  describe('API Performance Integration', () => {
    it('should handle rapid successive calls', async () => {
      const mockResponse = [
        { id: 1, name: 'char1', post_count: 1000, image_url: 'url1' },
        { id: 2, name: 'char2', post_count: 2000, image_url: 'url2' }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Make multiple rapid calls
      const promises = Array(5).fill(null).map(() => apiService.getRound());
      const results = await Promise.all(promises);

      // All should succeed
      results.forEach(result => {
        expect(result.data).toEqual(mockResponse);
        expect(result.error).toBeUndefined();
      });

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should handle concurrent getRound and getStats calls', async () => {
      const mockRoundResponse = [
        { id: 1, name: 'char1', post_count: 1000, image_url: 'url1' },
        { id: 2, name: 'char2', post_count: 2000, image_url: 'url2' }
      ];
      const mockStatsResponse = { totalCharacters: 5000 };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRoundResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStatsResponse,
        } as Response);

      const [roundResult, statsResult] = await Promise.all([
        apiService.getRound(),
        apiService.getStats()
      ]);

      expect(roundResult.data).toEqual(mockRoundResponse);
      expect(statsResult.data).toEqual(mockStatsResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
