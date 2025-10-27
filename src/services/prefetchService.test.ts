import { prefetchService } from './prefetchService';
import { apiService } from './api';
import { Character } from '../components/CharacterCard/CharacterCard.types';

// Mock the API service
jest.mock('./api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock Image constructor to resolve immediately
const mockImage = {
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
};

// @ts-ignore
global.Image = jest.fn(() => {
  // Resolve immediately for testing
  Promise.resolve().then(() => {
    if (mockImage.onload) {
      mockImage.onload();
    }
  });
  return mockImage;
});

describe('PrefetchService - Simple Tests', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    prefetchService.clearCache();
    mockImage.onload = null;
    mockImage.onerror = null;
    mockImage.src = '';
  });

  describe('basic functionality', () => {
    it('should fetch and cache character data', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });

      const result = await prefetchService.prefetchNextRound();

      expect(result).toEqual(mockCharacters);
      expect(mockApiService.getRound).toHaveBeenCalledTimes(1);
      expect(prefetchService.hasValidPrefetch()).toBe(true);
    });

    it('should return cached data if available', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });

      // First call
      await prefetchService.prefetchNextRound();
      
      // Second call should return cached data
      const result = await prefetchService.prefetchNextRound();
      
      expect(result).toEqual(mockCharacters);
      expect(mockApiService.getRound).toHaveBeenCalledTimes(1);
    });

    it('should consume prefetched data and clear cache', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
      
      await prefetchService.prefetchNextRound();
      expect(prefetchService.hasValidPrefetch()).toBe(true);

      const result = prefetchService.consumePrefetchedData();
      
      expect(result).toEqual(mockCharacters);
      expect(prefetchService.hasValidPrefetch()).toBe(false);
    });

    it('should return null if no prefetched data', () => {
      const result = prefetchService.consumePrefetchedData();
      expect(result).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      mockApiService.getRound.mockResolvedValue({ error: 'API Error' });

      await expect(prefetchService.prefetchNextRound()).rejects.toThrow('API Error');
      expect(prefetchService.hasValidPrefetch()).toBe(false);
    });
  });

  describe('cache management', () => {
    it('should return false initially', () => {
      expect(prefetchService.hasValidPrefetch()).toBe(false);
    });

    it('should return true after successful prefetch', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
      
      await prefetchService.prefetchNextRound();
      expect(prefetchService.hasValidPrefetch()).toBe(true);
    });

    it('should return false after cache is cleared', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
      
      await prefetchService.prefetchNextRound();
      prefetchService.clearCache();
      expect(prefetchService.hasValidPrefetch()).toBe(false);
    });
  });

  describe('duplicate request handling', () => {
    it('should not make duplicate requests if one is already in progress', async () => {
      mockApiService.getRound.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: mockCharacters }), 100))
      );

      const promise1 = prefetchService.prefetchNextRound();
      const promise2 = prefetchService.prefetchNextRound();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual(mockCharacters);
      expect(result2).toEqual(mockCharacters);
      expect(mockApiService.getRound).toHaveBeenCalledTimes(1);
    });
  });
});
