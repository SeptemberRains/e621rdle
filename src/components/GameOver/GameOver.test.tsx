import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameOver } from './GameOver';
import { GameOverProps } from './GameOver.types';


const defaultProps: GameOverProps = {
  currentStreak: 5,
  bestStreak: 10,
  onRestart: jest.fn(),
};

describe('GameOver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render game over message with current streak', () => {
    render(<GameOver {...defaultProps} />);
    
    expect(screen.getByText('Game Over!')).toBeInTheDocument();
    expect(screen.getByText('You got 5 correct in a row!')).toBeInTheDocument();
  });

  it('should render play again button', () => {
    render(<GameOver {...defaultProps} />);
    
    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  it('should call onRestart when play again button is clicked', () => {
    const mockOnRestart = jest.fn();
    render(<GameOver {...defaultProps} onRestart={mockOnRestart} />);
    
    const playAgainButton = screen.getByText('Play Again');
    fireEvent.click(playAgainButton);
    
    expect(mockOnRestart).toHaveBeenCalledTimes(1);
  });

  it('should show new personal best message when current streak equals best streak and is greater than 0', () => {
    render(<GameOver {...defaultProps} currentStreak={10} bestStreak={10} />);
    
    expect(screen.getByText('New personal best! 🎉')).toBeInTheDocument();
  });

  it('should not show new personal best message when current streak is 0', () => {
    render(<GameOver {...defaultProps} currentStreak={0} bestStreak={10} />);
    
    expect(screen.queryByText('New personal best! 🎉')).not.toBeInTheDocument();
  });

  it('should not show new personal best message when current streak is less than best streak', () => {
    render(<GameOver {...defaultProps} currentStreak={5} bestStreak={10} />);
    
    expect(screen.queryByText('New personal best! 🎉')).not.toBeInTheDocument();
  });

  it('should handle zero streak correctly', () => {
    render(<GameOver {...defaultProps} currentStreak={0} bestStreak={0} />);
    
    expect(screen.getByText('You got 0 correct in a row!')).toBeInTheDocument();
    expect(screen.queryByText('New personal best! 🎉')).not.toBeInTheDocument();
  });

  it('should handle large numbers correctly', () => {
    render(<GameOver {...defaultProps} currentStreak={999} bestStreak={1000} />);
    
    expect(screen.getByText('You got 999 correct in a row!')).toBeInTheDocument();
    expect(screen.queryByText('New personal best! 🎉')).not.toBeInTheDocument();
  });

  it('should handle new best streak correctly', () => {
    render(<GameOver {...defaultProps} currentStreak={15} bestStreak={15} />);
    
    expect(screen.getByText('You got 15 correct in a row!')).toBeInTheDocument();
    expect(screen.getByText('New personal best! 🎉')).toBeInTheDocument();
  });

  it('should render with different streak values', () => {
    const { rerender } = render(<GameOver {...defaultProps} currentStreak={3} bestStreak={7} />);
    
    expect(screen.getByText('You got 3 correct in a row!')).toBeInTheDocument();
    
    rerender(<GameOver {...defaultProps} currentStreak={12} bestStreak={12} />);
    
    expect(screen.getByText('You got 12 correct in a row!')).toBeInTheDocument();
    expect(screen.getByText('New personal best! 🎉')).toBeInTheDocument();
  });
});
