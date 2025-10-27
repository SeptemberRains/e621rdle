// GameOver component props
export interface GameOverProps {
  currentStreak: number;
  bestStreak: number;
  onRestart: () => void;
}
