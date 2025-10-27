import React from 'react';
import styled from 'styled-components';
import { ResultMessageProps } from './ResultMessage.types';
import { formatCharacterName, formatPostCount } from '@/utils/gameLogic';

const ResultContainer = styled.div<{ isCorrect: boolean }>`
  background: ${props => 
    props.isCorrect 
      ? 'rgba(76, 175, 80, 0.2)' 
      : 'rgba(244, 67, 54, 0.2)'
  };
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
  color: white;
  border: 1px solid ${props => 
    props.isCorrect 
      ? 'rgba(76, 175, 80, 0.4)' 
      : 'rgba(244, 67, 54, 0.4)'
  };

  h3 {
    margin-bottom: 15px;
    font-size: 1.5rem;
  }

  p {
    margin-bottom: 15px;
    font-size: 1.1rem;
    line-height: 1.4;
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
  margin-top: 15px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ResultMessage: React.FC<ResultMessageProps> = ({ 
  isCorrect, 
  winner, 
  loser, 
  onNext 
}) => {
  const winnerName = formatCharacterName(winner.name);
  const loserName = formatCharacterName(loser.name);
  const winnerCount = formatPostCount(winner.post_count);
  const loserCount = formatPostCount(loser.post_count);

  return (
    <ResultContainer isCorrect={isCorrect}>
      {isCorrect ? (
        <div>
          <h3>Correct! 🎉</h3>
          <p>
            <strong>{winnerName}</strong> has{' '}
            <strong>{winnerCount}</strong> posts, while{' '}
            <strong>{loserName}</strong> has{' '}
            <strong>{loserCount}</strong> posts.
          </p>
        </div>
      ) : (
        <div>
          <h3>Wrong! ❌</h3>
          <p>
            <strong>{winnerName}</strong> has{' '}
            <strong>{winnerCount}</strong> posts, while{' '}
            <strong>{loserName}</strong> has{' '}
            <strong>{loserCount}</strong> posts.
          </p>
        </div>
      )}
      <Button onClick={onNext}>
        {isCorrect ? 'Next Round' : 'Try Again'}
      </Button>
    </ResultContainer>
  );
};

