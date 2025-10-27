import { Character } from '../../components/CharacterCard/CharacterCard.types';

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export type GetRoundResponse = Character[];
