import React from 'react';
import styled from 'styled-components';
import { GameState } from '@/types';
import { useGameState } from '@/hooks/useGameState';
import { getWinnerAndLoser } from '@/utils/gameLogic';
import { CharacterCard } from './CharacterCard';
import { StreakDisplay } from './StreakDisplay';
import { GameOver } from './GameOver';
import { ResultMessage } from './ResultMessage';

const GameContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  color: white;

  h1 {
    font-size: 3rem;
    margin-bottom: 10px;
    color: rgb(232, 196, 70);
  }

  p {
    font-size: 1.2rem;
    opacity: 0.9;
  }
`;

const GameBoard = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 800px;
  justify-content: center;
  flex-wrap: wrap;
`;

const GameControls = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Loading = styled.div`
  text-align: center;
  color: white;
  font-size: 1.2rem;
`;

const Error = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #d32f2f;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
`;

const ErrorButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  margin-top: 15px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const Game: React.FC = () => {
  const {
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
  } = useGameState();

  // Render loading state
  if (loading) {
    return (
      <GameContainer>
        <Loading>Loading new round...</Loading>
      </GameContainer>
    );
  }

  // Render error state
  if (error) {
    return (
      <GameContainer>
        <Error>
          {error}
          <br />
          <ErrorButton onClick={fetchRound}>
            Try Again
          </ErrorButton>
        </Error>
      </GameContainer>
    );
  }

  // Render game over state
  if (gameState === GameState.GAME_OVER) {
    return (
      <GameContainer>
        <Header>
          <h1>e621rdle</h1>
          <p>Which character has more posts on e621.net?</p>
        </Header>
        <StreakDisplay currentStreak={currentStreak} bestStreak={bestStreak} />
        <GameOver 
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          onRestart={handleRestart}
        />
      </GameContainer>
    );
  }

  // Get winner and loser for result display
  const { winner, loser } = getWinnerAndLoser(characters);

  // Main game render
  return (
    <GameContainer>
      <Header>
        <h1>e621rdle</h1>
        <p>Which character has more posts on e621.net?</p>
      </Header>

      <StreakDisplay currentStreak={currentStreak} bestStreak={bestStreak} />

      <GameBoard>
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onClick={handleCharacterSelect}
            revealed={gameState === GameState.REVEALED}
            isCorrect={gameState === GameState.REVEALED && character.id === selectedCharacter?.id ? isCorrect : null}
            isGrayedOut={gameState === GameState.REVEALED && character.id !== selectedCharacter?.id}
            disabled={gameState !== GameState.PLAYING}
          />
        ))}
      </GameBoard>

      {gameState === GameState.REVEALED && winner && loser && (
        <ResultMessage
          isCorrect={isCorrect || false}
          winner={winner}
          loser={loser}
          onNext={handleNext}
        />
      )}

      <GameControls>
        <Button onClick={fetchRound}>
          Skip Round
        </Button>
      </GameControls>
    </GameContainer>
  );
};

