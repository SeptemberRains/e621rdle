import { Character } from '../CharacterCard/CharacterCard.types';

// Game state enum
export enum GameState {
  PLAYING = 'playing',
  REVEALED = 'revealed',
  GAME_OVER = 'gameOver'
}

// Game state interface
export interface GameStateData {
  characters: Character[];
  loading: boolean;
  error: string | null;
  gameState: GameState;
  selectedCharacter: Character | null;
  currentStreak: number;
  bestStreak: number;
  isCorrect: boolean | null;
}

// Hook return types
export interface UseGameStateReturn extends GameStateData {
  handleCharacterSelect: (character: Character) => void;
  handleNext: () => void;
  handleRestart: () => void;
  fetchRound: () => Promise<void>;
}
