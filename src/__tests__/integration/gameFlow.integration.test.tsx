import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Game } from '../../components/Game/Game';
import { apiService } from '../../services/api';
import { Character } from '../../components/CharacterCard/CharacterCard.types';

// Mock the API service
jest.mock('../../services/api');
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

describe('Game Flow Integration Tests', () => {
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
    mockApiService.getRound.mockResolvedValue({ data: mockCharacters });
  });

  describe('Basic Game Play Flow', () => {
    it('should complete a full game round from start to finish', async () => {
      render(<Game />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('e621rdle')).toBeInTheDocument();
      });

      // Should show both characters
      expect(screen.getByText('test character 1')).toBeInTheDocument();
      expect(screen.getByText('test character 2')).toBeInTheDocument();

      // Should show streak display
      expect(screen.getByText('Your Streaks')).toBeInTheDocument();
      expect(screen.getAllByText('0')).toHaveLength(2); // Current and best streak both 0
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Best')).toBeInTheDocument();

      // Click on the character with higher post count (correct answer)
      const character2Card = screen.getByText('test character 2').closest('div');
      fireEvent.click(character2Card!);

      // Should show result message
      await waitFor(() => {
        expect(screen.getByText('Correct! 🎉')).toBeInTheDocument();
      });

      // Should show post counts
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'test character 2 has 2,000 posts, while test character 1 has 1,000 posts.';
      })).toBeInTheDocument();

      // Should show next round button
      expect(screen.getByText('Next Round')).toBeInTheDocument();

      // Click next round
      fireEvent.click(screen.getByText('Next Round'));

      // Should fetch new round
      await waitFor(() => {
        expect(mockApiService.getRound).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle incorrect answer and show game over', async () => {
      render(<Game />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('e621rdle')).toBeInTheDocument();
      });

      // Click on the character with lower post count (incorrect answer)
      const character1Card = screen.getByText('test character 1').closest('div');
      fireEvent.click(character1Card!);

      // Should show result message
      await waitFor(() => {
        expect(screen.getByText('Wrong! ❌')).toBeInTheDocument();
      });

      // Should show try again button
      expect(screen.getByText('Try Again')).toBeInTheDocument();

      // Click try again
      fireEvent.click(screen.getByText('Try Again'));

      // Should show game over screen
      await waitFor(() => {
        expect(screen.getByText('Game Over!')).toBeInTheDocument();
      });

      // Should show streak information
      expect(screen.getByText('You got 0 correct in a row!')).toBeInTheDocument();
    });

    it('should handle multiple correct answers and track streak', async () => {
      // Mock multiple rounds
      mockApiService.getRound
        .mockResolvedValueOnce({ data: mockCharacters })
        .mockResolvedValueOnce({ data: mockCharacters })
        .mockResolvedValueOnce({ data: mockCharacters });

      render(<Game />);

      // First correct answer
      await waitFor(() => {
        expect(screen.getByText('test character 2')).toBeInTheDocument();
      });

      const character2Card = screen.getByText('test character 2').closest('div');
      fireEvent.click(character2Card!);

      await waitFor(() => {
        expect(screen.getByText('Correct! 🎉')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Next Round'));

      // Second correct answer
      await waitFor(() => {
        expect(screen.getByText('test character 2')).toBeInTheDocument();
      });

      const character2Card2 = screen.getByText('test character 2').closest('div');
      fireEvent.click(character2Card2!);

      await waitFor(() => {
        expect(screen.getByText('Correct! 🎉')).toBeInTheDocument();
      });

      // Should show updated streak
      expect(screen.getAllByText('2')).toHaveLength(2); // Both current and best should be 2
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Best')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('should handle API errors gracefully', async () => {
      mockApiService.getRound.mockRejectedValue(new Error('Network error'));

      render(<Game />);

      // Should show loading state initially
      expect(screen.getByText('Loading new round...')).toBeInTheDocument();

      // Should eventually show game with error handling
      await waitFor(() => {
        expect(screen.getByText('e621rdle')).toBeInTheDocument();
      });
    });
  });

  describe('Streak Persistence', () => {
    it('should save and restore best streak from localStorage', async () => {
      // Set initial best streak in localStorage
      localStorageMock.getItem.mockReturnValue('5');

      render(<Game />);

      // Should load with saved best streak
      await waitFor(() => {
        expect(screen.getByText('Your Streaks')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument(); // Current streak
        expect(screen.getByText('5')).toBeInTheDocument(); // Best streak
        expect(screen.getByText('Current')).toBeInTheDocument();
        expect(screen.getByText('Best')).toBeInTheDocument();
      });

      // Should save to localStorage when best streak is updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('e621rdle-best-streak', '5');
    });

    it('should update best streak when current streak exceeds it', async () => {
      // Mock multiple successful rounds
      mockApiService.getRound
        .mockResolvedValueOnce({ data: mockCharacters })
        .mockResolvedValueOnce({ data: mockCharacters })
        .mockResolvedValueOnce({ data: mockCharacters });

      render(<Game />);

      // Play two correct rounds
      for (let i = 0; i < 2; i++) {
        await waitFor(() => {
          expect(screen.getByText('test character 2')).toBeInTheDocument();
        });

        const character2Card = screen.getByText('test character 2').closest('div');
        fireEvent.click(character2Card!);

        await waitFor(() => {
          expect(screen.getByText('Correct! 🎉')).toBeInTheDocument();
        });

        if (i < 1) {
          fireEvent.click(screen.getByText('Next Round'));
        }
      }

      // Should show new best streak
      expect(screen.getAllByText('2')).toHaveLength(2); // Both current and best should be 2
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Best')).toBeInTheDocument();

      // Should save new best streak to localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('e621rdle-best-streak', '2');
    });

    it('should reset current streak on game over but keep best streak', async () => {
      // Set initial best streak
      localStorageMock.getItem.mockReturnValue('3');

      render(<Game />);

      // Play incorrect round
      await waitFor(() => {
        expect(screen.getByText('test character 1')).toBeInTheDocument();
      });

      const character1Card = screen.getByText('test character 1').closest('div');
      fireEvent.click(character1Card!);

      await waitFor(() => {
        expect(screen.getByText('Wrong! ❌')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Try Again'));

      // Should show game over with reset current streak but preserved best streak
      await waitFor(() => {
        expect(screen.getByText('Game Over!')).toBeInTheDocument();
      });

      expect(screen.getByText('You got 0 correct in a row!')).toBeInTheDocument();
      expect(screen.getByText('Your Streaks')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Current streak
      expect(screen.getByText('3')).toBeInTheDocument(); // Best streak
      expect(screen.getByText('Current')).toBeInTheDocument();
      expect(screen.getByText('Best')).toBeInTheDocument();
    });

    it('should handle invalid localStorage data gracefully', async () => {
      // Set invalid data in localStorage
      localStorageMock.getItem.mockReturnValue('invalid');

      render(<Game />);

      // Should default to 0 best streak
      await waitFor(() => {
        expect(screen.getByText('Your Streaks')).toBeInTheDocument();
        expect(screen.getAllByText('0')).toHaveLength(2); // Both current and best should be 0
        expect(screen.getByText('Current')).toBeInTheDocument();
        expect(screen.getByText('Best')).toBeInTheDocument();
      });
    });
  });

  describe('Skip Round Functionality', () => {
    it('should allow skipping rounds', async () => {
      mockApiService.getRound
        .mockResolvedValueOnce({ data: mockCharacters })
        .mockResolvedValueOnce({ data: mockCharacters });

      render(<Game />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('test character 1')).toBeInTheDocument();
      });

      // Click skip round
      fireEvent.click(screen.getByText('Skip Round'));

      // Should fetch new round
      await waitFor(() => {
        expect(mockApiService.getRound).toHaveBeenCalledTimes(2);
      });
    });
  });
});
