import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Game } from './Game';
import { useGameState } from '../../hooks/useGameState';
import { GameState } from './Game.types';
import { Character } from '../CharacterCard/CharacterCard.types';

// Mock the useGameState hook
jest.mock('../../hooks/useGameState');
const mockUseGameState = useGameState as jest.MockedFunction<typeof useGameState>;


// Mock child components
jest.mock('../CharacterCard/CharacterCard', () => ({
  CharacterCard: ({ character, onClick, revealed, isCorrect, isGrayedOut, disabled }: any) => (
    <div
      data-testid={`character-card-${character.id}`}
      onClick={() => !disabled && onClick?.(character)}
      data-revealed={revealed.toString()}
      data-correct={isCorrect?.toString() || 'null'}
      data-grayed-out={isGrayedOut.toString()}
      data-disabled={disabled.toString()}
    >
      {character.name}
    </div>
  ),
}));

jest.mock('../StreakDisplay/StreakDisplay', () => ({
  StreakDisplay: ({ currentStreak, bestStreak }: any) => (
    <div data-testid="streak-display">
      Current: {currentStreak}, Best: {bestStreak}
    </div>
  ),
}));

jest.mock('../GameOver/GameOver', () => ({
  GameOver: ({ currentStreak, bestStreak, onRestart }: any) => (
    <div data-testid="game-over">
      Game Over! Streak: {currentStreak}, Best: {bestStreak}
      <button onClick={onRestart}>Restart</button>
    </div>
  ),
}));

jest.mock('../ResultMessage/ResultMessage', () => ({
  ResultMessage: ({ isCorrect, winner, loser, onNext }: any) => (
    <div data-testid="result-message">
      {isCorrect ? 'Correct!' : 'Wrong!'} Winner: {winner.name}, Loser: {loser.name}
      <button onClick={onNext}>Next</button>
    </div>
  ),
}));

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

const defaultMockReturn = {
  characters: [],
  loading: false,
  error: null,
  gameState: GameState.PLAYING,
  selectedCharacter: null,
  currentStreak: 0,
  bestStreak: 0,
  isCorrect: null,
  handleCharacterSelect: jest.fn(),
  handleNext: jest.fn(),
  handleRestart: jest.fn(),
  fetchRound: jest.fn(),
};

describe('Game', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGameState.mockReturnValue(defaultMockReturn);
  });

  it('should render loading state', () => {
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      loading: true,
    });

    render(<Game />);
    
    expect(screen.getByText('Loading new round...')).toBeInTheDocument();
  });

  it('should render error state with retry button', () => {
    const mockFetchRound = jest.fn();
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      error: 'Network error',
      fetchRound: mockFetchRound,
    });

    render(<Game />);
    
    expect(screen.getByText('Network error')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(mockFetchRound).toHaveBeenCalled();
  });

  it('should render game over state', () => {
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      gameState: GameState.GAME_OVER,
      currentStreak: 5,
      bestStreak: 10,
    });

    render(<Game />);
    
    expect(screen.getByTestId('game-over')).toBeInTheDocument();
    expect(screen.getByText('Current: 5, Best: 10')).toBeInTheDocument();
  });

  it('should render main game state with characters', () => {
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: mockCharacters,
    });

    render(<Game />);
    
    expect(screen.getByText('e621rdle')).toBeInTheDocument();
    expect(screen.getByText('Which character has more posts on e621.net?')).toBeInTheDocument();
    expect(screen.getByTestId('streak-display')).toBeInTheDocument();
    expect(screen.getByTestId('character-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('character-card-2')).toBeInTheDocument();
    expect(screen.getByText('Skip Round')).toBeInTheDocument();
  });

  it('should pass correct props to CharacterCard components', () => {
    const mockHandleCharacterSelect = jest.fn();
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: mockCharacters,
      gameState: GameState.PLAYING,
      handleCharacterSelect: mockHandleCharacterSelect,
    });

    render(<Game />);
    
    const card1 = screen.getByTestId('character-card-1');
    const card2 = screen.getByTestId('character-card-2');
    
    expect(card1).toHaveAttribute('data-revealed', 'false');
    expect(card1).toHaveAttribute('data-correct', 'null');
    expect(card1).toHaveAttribute('data-grayed-out', 'false');
    expect(card1).toHaveAttribute('data-disabled', 'false');
    
    expect(card2).toHaveAttribute('data-revealed', 'false');
    expect(card2).toHaveAttribute('data-correct', 'null');
    expect(card2).toHaveAttribute('data-grayed-out', 'false');
    expect(card2).toHaveAttribute('data-disabled', 'false');
  });

  it('should pass correct props to CharacterCard when revealed', () => {
    const mockHandleCharacterSelect = jest.fn();
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: mockCharacters,
      gameState: GameState.REVEALED,
      selectedCharacter: mockCharacters[0],
      isCorrect: true,
      handleCharacterSelect: mockHandleCharacterSelect,
    });

    render(<Game />);
    
    const card1 = screen.getByTestId('character-card-1');
    const card2 = screen.getByTestId('character-card-2');
    
    expect(card1).toHaveAttribute('data-revealed', 'true');
    expect(card1).toHaveAttribute('data-correct', 'true');
    expect(card1).toHaveAttribute('data-grayed-out', 'false');
    expect(card1).toHaveAttribute('data-disabled', 'true');
    
    expect(card2).toHaveAttribute('data-revealed', 'true');
    expect(card2).toHaveAttribute('data-correct', 'null');
    expect(card2).toHaveAttribute('data-grayed-out', 'true');
    expect(card2).toHaveAttribute('data-disabled', 'true');
  });

  it('should render ResultMessage when game state is revealed', () => {
    const mockHandleNext = jest.fn();
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: mockCharacters,
      gameState: GameState.REVEALED,
      selectedCharacter: mockCharacters[0],
      isCorrect: true,
      handleNext: mockHandleNext,
    });

    render(<Game />);
    
    expect(screen.getByTestId('result-message')).toBeInTheDocument();
  });

  it('should call handleCharacterSelect when character is clicked', () => {
    const mockHandleCharacterSelect = jest.fn();
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: mockCharacters,
      gameState: GameState.PLAYING,
      handleCharacterSelect: mockHandleCharacterSelect,
    });

    render(<Game />);
    
    const card1 = screen.getByTestId('character-card-1');
    fireEvent.click(card1);
    
    expect(mockHandleCharacterSelect).toHaveBeenCalledWith(mockCharacters[0]);
  });

  it('should call handleNext when result message next button is clicked', () => {
    const mockHandleNext = jest.fn();
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: mockCharacters,
      gameState: GameState.REVEALED,
      selectedCharacter: mockCharacters[0],
      isCorrect: true,
      handleNext: mockHandleNext,
    });

    render(<Game />);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(mockHandleNext).toHaveBeenCalled();
  });

  it('should call handleRestart when game over restart button is clicked', () => {
    const mockHandleRestart = jest.fn();
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      gameState: GameState.GAME_OVER,
      currentStreak: 5,
      bestStreak: 10,
      handleRestart: mockHandleRestart,
    });

    render(<Game />);
    
    const restartButton = screen.getByText('Restart');
    fireEvent.click(restartButton);
    
    expect(mockHandleRestart).toHaveBeenCalled();
  });

  it('should call fetchRound when skip round button is clicked', () => {
    const mockFetchRound = jest.fn();
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: mockCharacters,
      fetchRound: mockFetchRound,
    });

    render(<Game />);
    
    const skipButton = screen.getByText('Skip Round');
    fireEvent.click(skipButton);
    
    expect(mockFetchRound).toHaveBeenCalled();
  });

  it('should not render ResultMessage when game state is not revealed', () => {
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: mockCharacters,
      gameState: GameState.PLAYING,
    });

    render(<Game />);
    
    expect(screen.queryByTestId('result-message')).not.toBeInTheDocument();
  });

  it('should handle empty characters array', () => {
    mockUseGameState.mockReturnValue({
      ...defaultMockReturn,
      characters: [],
    });

    render(<Game />);
    
    expect(screen.getByText('e621rdle')).toBeInTheDocument();
    expect(screen.queryByTestId('character-card-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('character-card-2')).not.toBeInTheDocument();
  });
});
