import { Character } from '../CharacterCard/CharacterCard.types';

// ResultMessage component props
export interface ResultMessageProps {
  isCorrect: boolean;
  winner: Character;
  loser: Character;
  onNext: () => void;
}
