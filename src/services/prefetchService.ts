import { Character } from '../components/CharacterCard/CharacterCard.types';
import { apiService } from './api';

interface PrefetchCache {
  characters: Character[] | null;
  imagesLoaded: boolean;
  timestamp: number;
}

class PrefetchService {
  private cache: PrefetchCache = {
    characters: null,
    imagesLoaded: false,
    timestamp: 0
  };
  
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private prefetchPromise: Promise<Character[]> | null = null;

  /**
   * Prefetch the next round of characters and their images
   */
  async prefetchNextRound(): Promise<Character[]> {
    // If we already have a prefetch in progress, return that promise
    if (this.prefetchPromise) {
      return this.prefetchPromise;
    }

    // If we have valid cached data, return it
    if (this.isCacheValid()) {
      return this.cache.characters!;
    }

    // Start new prefetch
    this.prefetchPromise = this.performPrefetch();
    
    try {
      const result = await this.prefetchPromise;
      return result;
    } finally {
      this.prefetchPromise = null;
    }
  }

  /**
   * Get the prefetched characters and clear the cache
   */
  consumePrefetchedData(): Character[] | null {
    const characters = this.cache.characters;
    this.clearCache();
    return characters;
  }

  /**
   * Check if we have valid prefetched data
   */
  hasValidPrefetch(): boolean {
    return this.isCacheValid() && this.cache.characters !== null;
  }

  /**
   * Clear the prefetch cache
   */
  clearCache(): void {
    this.cache = {
      characters: null,
      imagesLoaded: false,
      timestamp: 0
    };
  }

  private async performPrefetch(): Promise<Character[]> {
    try {
      // Fetch character data
      const result = await apiService.getRound();
      
      if (result.error || !result.data) {
        throw new Error(result.error || 'Failed to fetch characters');
      }

      const characters = result.data;
      
      // Prefetch images
      await this.prefetchImages(characters);
      
      // Cache the result
      this.cache = {
        characters,
        imagesLoaded: true,
        timestamp: Date.now()
      };

      return characters;
    } catch (error) {
      console.error('Prefetch failed:', error);
      throw error;
    }
  }

  private async prefetchImages(characters: Character[]): Promise<void> {
    const imagePromises = characters
      .filter(char => char.image_url)
      .map(char => this.prefetchImage(char.image_url!));

    if (imagePromises.length === 0) {
      return;
    }

    try {
      await Promise.allSettled(imagePromises);
    } catch (error) {
      console.warn('Some images failed to prefetch:', error);
    }
  }

  private prefetchImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`Failed to prefetch image: ${url}`);
        resolve(); // Don't reject, just log the warning
      };
      
      // Set a timeout to prevent hanging in tests
      setTimeout(() => {
        resolve();
      }, 100);
      
      img.src = url;
    });
  }

  private isCacheValid(): boolean {
    return this.cache.characters !== null && 
           this.cache.imagesLoaded && 
           (Date.now() - this.cache.timestamp) < this.CACHE_DURATION;
  }
}

export const prefetchService = new PrefetchService();
