import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';
import { apiService } from '../services/api';
import { GameState } from '../components/Game/Game.types';
import { Character } from '../components/CharacterCard/CharacterCard.types';

// Mock the API service
jest.mock('../services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useGameState', () => {
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
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });

      const { result } = renderHook(() => useGameState());

      expect(result.current.characters).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.gameState).toBe(GameState.PLAYING);
      expect(result.current.selectedCharacter).toBeNull();
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.bestStreak).toBe(0);
      expect(result.current.isCorrect).toBeNull();
    });

    it('should load best streak from localStorage on mount', () => {
      localStorageMock.getItem.mockReturnValue('5');
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });

      const { result } = renderHook(() => useGameState());

      expect(localStorageMock.getItem).toHaveBeenCalledWith('e621rdle-best-streak');
      expect(result.current.bestStreak).toBe(5);
    });

    it('should handle invalid best streak value in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid');
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });

      const { result } = renderHook(() => useGameState());

      expect(result.current.bestStreak).toBe(0);
    });
  });

  describe('fetchRound', () => {
    it('should successfully fetch round data', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      expect(result.current.characters).toEqual(mockCharacters);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.gameState).toBe(GameState.PLAYING);
      expect(result.current.selectedCharacter).toBeNull();
      expect(result.current.isCorrect).toBeNull();
    });

    it('should handle API error', async () => {
      const errorMessage = 'API Error';
      mockApiService.getRound.mockResolvedValue({ error: errorMessage });

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      expect(result.current.characters).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      mockApiService.getRound.mockRejectedValue(networkError);

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      expect(result.current.characters).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle no data received', async () => {
      mockApiService.getRound.mockResolvedValue({});

      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      expect(result.current.characters).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('No data received');
    });
  });

  describe('handleCharacterSelect', () => {
    beforeEach(async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
    });

    it('should select character and reveal result when correct', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]); // Higher post count
      });

      expect(result.current.selectedCharacter).toEqual(mockCharacters[1]);
      expect(result.current.gameState).toBe(GameState.REVEALED);
      expect(result.current.isCorrect).toBe(true);
      expect(result.current.currentStreak).toBe(1);
    });

    it('should select character and reveal result when incorrect', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[0]); // Lower post count
      });

      expect(result.current.selectedCharacter).toEqual(mockCharacters[0]);
      expect(result.current.gameState).toBe(GameState.REVEALED);
      expect(result.current.isCorrect).toBe(false);
      expect(result.current.currentStreak).toBe(0);
    });

    it('should not select character when game state is not PLAYING', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      // Set game state to REVEALED
      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]);
      });

      const previousState = result.current.gameState;
      const previousSelected = result.current.selectedCharacter;

      // Try to select again
      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[0]);
      });

      expect(result.current.gameState).toBe(previousState);
      expect(result.current.selectedCharacter).toBe(previousSelected);
    });

    it('should update best streak when current streak exceeds it', async () => {
      localStorageMock.getItem.mockReturnValue('3');
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      // Make 2 correct guesses
      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]);
      });

      await act(() => {
        result.current.handleNext();
      });

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]);
      });

      expect(result.current.currentStreak).toBe(2);
      expect(result.current.bestStreak).toBe(3); // Should not update since it's not higher
    });
  });

  describe('handleNext', () => {
    beforeEach(async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
    });

    it('should fetch new round when guess is correct', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]);
      });

      await act(() => {
        result.current.handleNext();
      });

      expect(mockApiService.getRound).toHaveBeenCalledTimes(3);
    });

    it('should set game over when guess is incorrect', async () => {
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[0]);
      });

      await act(() => {
        result.current.handleNext();
      });

      expect(result.current.gameState).toBe(GameState.GAME_OVER);
    });
  });

  describe('handleRestart', () => {
    it('should reset current streak and fetch new round', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
      const { result } = renderHook(() => useGameState());

      // Set up some state
      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]);
      });

      expect(result.current.currentStreak).toBe(1);

      await act(() => {
        result.current.handleRestart();
      });

      expect(result.current.currentStreak).toBe(0);
      expect(mockApiService.getRound).toHaveBeenCalledTimes(3);
    });
  });

  describe('localStorage integration', () => {
    it('should save best streak to localStorage when it changes', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('e621rdle-best-streak', '1');
    });
  });

  describe('body class management', () => {
    it('should add correct-answer class when answer is correct', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]);
      });

      expect(document.body.classList.contains('correct-answer')).toBe(true);
      expect(document.body.classList.contains('incorrect-answer')).toBe(false);
    });

    it('should add incorrect-answer class when answer is incorrect', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
      const { result } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[0]);
      });

      expect(document.body.classList.contains('incorrect-answer')).toBe(true);
      expect(document.body.classList.contains('correct-answer')).toBe(false);
    });

    it('should clean up body classes on unmount', async () => {
      mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
      const { result, unmount } = renderHook(() => useGameState());

      await act(async () => {
        await result.current.fetchRound();
      });

      await act(() => {
        result.current.handleCharacterSelect(mockCharacters[1]);
      });

      unmount();

      expect(document.body.classList.contains('correct-answer')).toBe(false);
      expect(document.body.classList.contains('incorrect-answer')).toBe(false);
    });
  });
});
