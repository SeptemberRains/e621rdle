import {
  isCorrectSelection,
  getWinnerAndLoser,
  formatCharacterName,
  formatPostCount,
  validateDifferentPostCounts,
} from './gameLogic';
import { Character } from '../components/CharacterCard/CharacterCard.types';

describe('gameLogic', () => {
  const mockCharacter1: Character = {
    id: 1,
    name: 'test_character_1',
    post_count: 1000,
    image_url: 'https://example.com/image1.jpg'
  };

  const mockCharacter2: Character = {
    id: 2,
    name: 'test_character_2',
    post_count: 2000,
    image_url: 'https://example.com/image2.jpg'
  };

  describe('isCorrectSelection', () => {
    it('should return true when selected character has more posts', () => {
      const characters = [mockCharacter1, mockCharacter2];
      const result = isCorrectSelection(mockCharacter2, characters);
      expect(result).toBe(true);
    });

    it('should return false when selected character has fewer posts', () => {
      const characters = [mockCharacter1, mockCharacter2];
      const result = isCorrectSelection(mockCharacter1, characters);
      expect(result).toBe(false);
    });

    it('should return false when other character is not found', () => {
      const characters = [mockCharacter1];
      const result = isCorrectSelection(mockCharacter1, characters);
      expect(result).toBe(false);
    });

    it('should return false when characters array is empty', () => {
      const characters: Character[] = [];
      const result = isCorrectSelection(mockCharacter1, characters);
      expect(result).toBe(false);
    });
  });

  describe('getWinnerAndLoser', () => {
    it('should return correct winner and loser when first character has more posts', () => {
      const character1 = { ...mockCharacter1, post_count: 3000 };
      const character2 = { ...mockCharacter2, post_count: 1000 };
      const characters = [character1, character2];
      
      const result = getWinnerAndLoser(characters);
      
      expect(result.winner).toEqual(character1);
      expect(result.loser).toEqual(character2);
    });

    it('should return correct winner and loser when second character has more posts', () => {
      const character1 = { ...mockCharacter1, post_count: 1000 };
      const character2 = { ...mockCharacter2, post_count: 3000 };
      const characters = [character1, character2];
      
      const result = getWinnerAndLoser(characters);
      
      expect(result.winner).toEqual(character2);
      expect(result.loser).toEqual(character1);
    });

    it('should handle equal post counts', () => {
      const character1 = { ...mockCharacter1, post_count: 1000 };
      const character2 = { ...mockCharacter2, post_count: 1000 };
      const characters = [character1, character2];
      
      const result = getWinnerAndLoser(characters);
      
      // Should pick the first one as winner when equal
      expect(result.winner).toEqual(character1);
      expect(result.loser).toEqual(character2);
    });

    it('should handle empty array', () => {
      const characters: Character[] = [];
      
      const result = getWinnerAndLoser(characters);
      
      expect(result.winner).toBeUndefined();
      expect(result.loser).toBeUndefined();
    });
  });

  describe('formatCharacterName', () => {
    it('should replace underscores with spaces', () => {
      expect(formatCharacterName('test_character_name')).toBe('test character name');
    });

    it('should handle multiple underscores', () => {
      expect(formatCharacterName('test__character___name')).toBe('test  character   name');
    });

    it('should handle names without underscores', () => {
      expect(formatCharacterName('testcharactername')).toBe('testcharactername');
    });

    it('should handle empty string', () => {
      expect(formatCharacterName('')).toBe('');
    });

    it('should handle only underscores', () => {
      expect(formatCharacterName('___')).toBe('   ');
    });
  });

  describe('formatPostCount', () => {
    it('should format numbers with locale-specific formatting', () => {
      expect(formatPostCount(1000)).toBe('1,000');
    });

    it('should format large numbers', () => {
      expect(formatPostCount(1234567)).toBe('1,234,567');
    });

    it('should format small numbers', () => {
      expect(formatPostCount(5)).toBe('5');
    });

    it('should format zero', () => {
      expect(formatPostCount(0)).toBe('0');
    });

    it('should format negative numbers', () => {
      expect(formatPostCount(-1000)).toBe('-1,000');
    });
  });

  describe('validateDifferentPostCounts', () => {
    it('should return true when characters have different post counts', () => {
      const characters = [mockCharacter1, mockCharacter2];
      expect(validateDifferentPostCounts(characters)).toBe(true);
    });

    it('should return false when characters have same post counts', () => {
      const character1 = { ...mockCharacter1, post_count: 1000 };
      const character2 = { ...mockCharacter2, post_count: 1000 };
      const characters = [character1, character2];
      expect(validateDifferentPostCounts(characters)).toBe(false);
    });

    it('should return false when array does not have exactly 2 characters', () => {
      const characters = [mockCharacter1];
      expect(validateDifferentPostCounts(characters)).toBe(false);
    });

    it('should return false when array has more than 2 characters', () => {
      const character3: Character = {
        id: 3,
        name: 'test_character_3',
        post_count: 3000,
        image_url: 'https://example.com/image3.jpg'
      };
      const characters = [mockCharacter1, mockCharacter2, character3];
      expect(validateDifferentPostCounts(characters)).toBe(false);
    });

    it('should return false when array is empty', () => {
      const characters: Character[] = [];
      expect(validateDifferentPostCounts(characters)).toBe(false);
    });
  });
});
