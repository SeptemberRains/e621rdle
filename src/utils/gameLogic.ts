import { Character } from '../components/CharacterCard/CharacterCard.types';

/**
 * Determines if a character selection is correct
 * @param selectedCharacter - The character the user selected
 * @param characters - Array of both characters in the round
 * @returns true if the selected character has more posts than the other
 */
export const isCorrectSelection = (
  selectedCharacter: Character,
  characters: Character[]
): boolean => {
  const otherCharacter = characters.find(c => c.id !== selectedCharacter.id);
  if (!otherCharacter) return false;
  
  return selectedCharacter.post_count > otherCharacter.post_count;
};

/**
 * Gets the winner and loser characters from a round
 * @param characters - Array of both characters in the round
 * @returns Object with winner and loser characters
 */
export const getWinnerAndLoser = (characters: Character[]) => {
  const winner = characters.find(c => 
    c.post_count === Math.max(...characters.map(ch => ch.post_count))
  );
  const loser = characters.find(c => c !== winner);
  
  return { winner, loser };
};

/**
 * Formats character name by replacing underscores with spaces
 * @param name - Character name with underscores
 * @returns Formatted character name
 */
export const formatCharacterName = (name: string): string => {
  return name.replace(/_/g, ' ');
};

/**
 * Formats post count with locale-specific number formatting
 * @param count - Post count number
 * @returns Formatted post count string
 */
export const formatPostCount = (count: number): string => {
  return count.toLocaleString();
};

/**
 * Validates that two characters have different post counts
 * @param characters - Array of characters to validate
 * @returns true if characters have different post counts
 */
export const validateDifferentPostCounts = (characters: Character[]): boolean => {
  if (characters.length !== 2) return false;
  return characters[0].post_count !== characters[1].post_count;
};

