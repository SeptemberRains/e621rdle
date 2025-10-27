import { useState, useEffect, useCallback } from 'react';
import { Character } from '../components/CharacterCard/CharacterCard.types';
import { GameState, UseGameStateReturn } from '../components/Game/Game.types';
import { apiService } from '@/services/api';
import { isCorrectSelection } from '@/utils/gameLogic';

const STORAGE_KEY = 'e621rdle-best-streak';

export const useGameState = (): UseGameStateReturn => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Load best streak from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        setBestStreak(parsed);
      }
    }
  }, []);

  // Save best streak to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, bestStreak.toString());
  }, [bestStreak]);

  // Update body background color based on game state
  useEffect(() => {
    const body = document.body;
    
    // Remove any existing answer classes
    body.classList.remove('correct-answer', 'incorrect-answer');
    
    // Add appropriate class when answer is revealed
    if (gameState === GameState.REVEALED && isCorrect !== null) {
      if (isCorrect) {
        body.classList.add('correct-answer');
      } else {
        body.classList.add('incorrect-answer');
      }
    }
    
    // Cleanup function to remove classes when component unmounts
    return () => {
      body.classList.remove('correct-answer', 'incorrect-answer');
    };
  }, [gameState, isCorrect]);

  // Fetch new round data
  const fetchRound = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getRound();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.data) {
        throw new Error('No data received');
      }
      
      setCharacters(result.data);
      setGameState(GameState.PLAYING);
      setSelectedCharacter(null);
      setIsCorrect(null);
    } catch (err) {
      console.error('Error fetching round:', err);
      setError(err instanceof Error ? err.message : 'Failed to load new round. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize game
  useEffect(() => {
    fetchRound();
  }, [fetchRound]);

  // Handle character selection
  const handleCharacterSelect = useCallback((character: Character) => {
    if (gameState !== GameState.PLAYING) return;

    setSelectedCharacter(character);
    
    // Determine if the guess is correct
    const correct = isCorrectSelection(character, characters);
    
    setIsCorrect(correct);
    setGameState(GameState.REVEALED);

    if (correct) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    }
  }, [gameState, characters, currentStreak, bestStreak]);

  // Handle next round or game over
  const handleNext = useCallback(() => {
    if (isCorrect) {
      fetchRound(); // Start new round
    } else {
      setGameState(GameState.GAME_OVER); // Show game over screen
    }
  }, [isCorrect, fetchRound]);

  // Restart game
  const handleRestart = useCallback(() => {
    setCurrentStreak(0);
    fetchRound();
  }, [fetchRound]);

  return {
    characters,
    loading,
    error,
    gameState,
    selectedCharacter,
    currentStreak,
    bestStreak,
    isCorrect,
    handleCharacterSelect,
    handleNext,
    handleRestart,
    fetchRound,
  };
};

