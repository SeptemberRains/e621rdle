import React from 'react';
import styled from 'styled-components';
import { GameOverProps } from '@/types';

const GameOverContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 400px;

  h2 {
    margin-bottom: 15px;
    font-size: 2rem;
  }

  p {
    margin-bottom: 10px;
    font-size: 1.1rem;
  }
`;

const Button = styled.button`
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const GameOver: React.FC<GameOverProps> = ({ 
  currentStreak, 
  bestStreak, 
  onRestart 
}) => {
  const isNewBest = currentStreak === bestStreak && currentStreak > 0;

  return (
    <GameOverContainer>
      <h2>Game Over!</h2>
      <p>You got {currentStreak} correct in a row!</p>
      {isNewBest && (
        <p><strong>New personal best! 🎉</strong></p>
      )}
      <Button onClick={onRestart}>
        Play Again
      </Button>
    </GameOverContainer>
  );
};

