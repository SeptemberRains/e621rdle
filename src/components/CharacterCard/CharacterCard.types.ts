// Character data structure
export interface Character {
  id: number;
  name: string;
  post_count: number;
  image_url: string | null;
}

// CharacterCard component props
export interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
  revealed: boolean;
  isCorrect: boolean | null;
  isGrayedOut: boolean;
  disabled: boolean;
}
