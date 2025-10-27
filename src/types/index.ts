// Character data structure
export interface Character {
  id: number;
  name: string;
  post_count: number;
  image_url: string | null;
}

// Game state enum
export enum GameState {
  PLAYING = 'playing',
  REVEALED = 'revealed',
  GAME_OVER = 'gameOver'
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export type GetRoundResponse = Character[];

// Component prop interfaces
export interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
  revealed: boolean;
  isCorrect: boolean | null;
  isGrayedOut: boolean;
  disabled: boolean;
}

export interface StreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
}

export interface GameOverProps {
  currentStreak: number;
  bestStreak: number;
  onRestart: () => void;
}

export interface ResultMessageProps {
  isCorrect: boolean;
  winner: Character;
  loser: Character;
  onNext: () => void;
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

