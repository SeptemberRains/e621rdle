import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultMessage } from './ResultMessage';
import { ResultMessageProps } from './ResultMessage.types';
import { Character } from '../CharacterCard/CharacterCard.types';


const mockWinner: Character = {
  id: 1,
  name: 'winner_character',
  post_count: 2000,
  image_url: 'https://example.com/winner.jpg'
};

const mockLoser: Character = {
  id: 2,
  name: 'loser_character',
  post_count: 1000,
  image_url: 'https://example.com/loser.jpg'
};

const defaultProps: ResultMessageProps = {
  isCorrect: true,
  winner: mockWinner,
  loser: mockLoser,
  onNext: jest.fn(),
};

describe('ResultMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when answer is correct', () => {
    it('should render correct message with winner and loser information', () => {
      render(<ResultMessage {...defaultProps} isCorrect={true} />);
      
      expect(screen.getByText('Correct! 🎉')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'winner character has 2,000 posts, while loser character has 1,000 posts.';
      })).toBeInTheDocument();
    });

    it('should render next round button', () => {
      render(<ResultMessage {...defaultProps} isCorrect={true} />);
      
      expect(screen.getByText('Next Round')).toBeInTheDocument();
    });

    it('should call onNext when next round button is clicked', () => {
      const mockOnNext = jest.fn();
      render(<ResultMessage {...defaultProps} isCorrect={true} onNext={mockOnNext} />);
      
      const nextButton = screen.getByText('Next Round');
      fireEvent.click(nextButton);
      
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('when answer is incorrect', () => {
    it('should render incorrect message with winner and loser information', () => {
      render(<ResultMessage {...defaultProps} isCorrect={false} />);
      
      expect(screen.getByText('Wrong! ❌')).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'winner character has 2,000 posts, while loser character has 1,000 posts.';
      })).toBeInTheDocument();
    });

    it('should render try again button', () => {
      render(<ResultMessage {...defaultProps} isCorrect={false} />);
      
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should call onNext when try again button is clicked', () => {
      const mockOnNext = jest.fn();
      render(<ResultMessage {...defaultProps} isCorrect={false} onNext={mockOnNext} />);
      
      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);
      
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('character name formatting', () => {
    it('should format character names by replacing underscores with spaces', () => {
      const winnerWithUnderscores: Character = {
        ...mockWinner,
        name: 'character_with_underscores'
      };
      const loserWithUnderscores: Character = {
        ...mockLoser,
        name: 'another_character_name'
      };

      render(<ResultMessage {...defaultProps} winner={winnerWithUnderscores} loser={loserWithUnderscores} />);
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'character with underscores has 2,000 posts, while another character name has 1,000 posts.';
      })).toBeInTheDocument();
    });

    it('should handle names with multiple underscores', () => {
      const winnerWithMultipleUnderscores: Character = {
        ...mockWinner,
        name: 'character__with___multiple____underscores'
      };
      const loserWithMultipleUnderscores: Character = {
        ...mockLoser,
        name: 'another___character___name'
      };

      render(<ResultMessage {...defaultProps} winner={winnerWithMultipleUnderscores} loser={loserWithMultipleUnderscores} />);
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'character  with   multiple    underscores has 2,000 posts, while another   character   name has 1,000 posts.';
      })).toBeInTheDocument();
    });
  });

  describe('post count formatting', () => {
    it('should format large post counts with locale formatting', () => {
      const winnerWithLargeCount: Character = {
        ...mockWinner,
        post_count: 1234567
      };
      const loserWithLargeCount: Character = {
        ...mockLoser,
        post_count: 987654
      };

      render(<ResultMessage {...defaultProps} winner={winnerWithLargeCount} loser={loserWithLargeCount} />);
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'winner character has 1,234,567 posts, while loser character has 987,654 posts.';
      })).toBeInTheDocument();
    });

    it('should handle zero post counts', () => {
      const winnerWithZeroCount: Character = {
        ...mockWinner,
        post_count: 0
      };
      const loserWithZeroCount: Character = {
        ...mockLoser,
        post_count: 0
      };

      render(<ResultMessage {...defaultProps} winner={winnerWithZeroCount} loser={loserWithZeroCount} />);
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'winner character has 0 posts, while loser character has 0 posts.';
      })).toBeInTheDocument();
    });

    it('should handle small post counts', () => {
      const winnerWithSmallCount: Character = {
        ...mockWinner,
        post_count: 5
      };
      const loserWithSmallCount: Character = {
        ...mockLoser,
        post_count: 3
      };

      render(<ResultMessage {...defaultProps} winner={winnerWithSmallCount} loser={loserWithSmallCount} />);
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'winner character has 5 posts, while loser character has 3 posts.';
      })).toBeInTheDocument();
    });
  });

  describe('different character combinations', () => {
    it('should handle characters with same post counts', () => {
      const winnerWithSameCount: Character = {
        ...mockWinner,
        post_count: 1000
      };
      const loserWithSameCount: Character = {
        ...mockLoser,
        post_count: 1000
      };

      render(<ResultMessage {...defaultProps} winner={winnerWithSameCount} loser={loserWithSameCount} />);
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'winner character has 1,000 posts, while loser character has 1,000 posts.';
      })).toBeInTheDocument();
    });

    it('should handle very different post counts', () => {
      const winnerWithVeryHighCount: Character = {
        ...mockWinner,
        post_count: 9999999
      };
      const loserWithVeryLowCount: Character = {
        ...mockLoser,
        post_count: 1
      };

      render(<ResultMessage {...defaultProps} winner={winnerWithVeryHighCount} loser={loserWithVeryLowCount} />);
      
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'winner character has 9,999,999 posts, while loser character has 1 posts.';
      })).toBeInTheDocument();
    });
  });

  describe('button behavior', () => {
    it('should call onNext multiple times when button is clicked multiple times', () => {
      const mockOnNext = jest.fn();
      render(<ResultMessage {...defaultProps} onNext={mockOnNext} />);
      
      const button = screen.getByText('Next Round');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockOnNext).toHaveBeenCalledTimes(3);
    });

    it('should work with different button text based on isCorrect', () => {
      const { rerender } = render(<ResultMessage {...defaultProps} isCorrect={true} />);
      expect(screen.getByText('Next Round')).toBeInTheDocument();
      
      rerender(<ResultMessage {...defaultProps} isCorrect={false} />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });
});
