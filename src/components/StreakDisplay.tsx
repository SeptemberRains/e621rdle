import React from 'react';
import styled from 'styled-components';
import { StreakDisplayProps } from '@/types';

const StreakContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px 25px;
  margin-bottom: 30px;
  text-align: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);

  h3 {
    margin-bottom: 10px;
    font-size: 1.1rem;
  }
`;

const StreakNumbers = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
`;

const StreakItem = styled.div`
  text-align: center;
`;

const StreakNumber = styled.span`
  font-size: 2rem;
  font-weight: bold;
  display: block;
`;

const StreakLabel = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
`;

export const StreakDisplay: React.FC<StreakDisplayProps> = ({ 
  currentStreak, 
  bestStreak 
}) => {
  return (
    <StreakContainer>
      <h3>Your Streaks</h3>
      <StreakNumbers>
        <StreakItem>
          <StreakNumber>{currentStreak}</StreakNumber>
          <StreakLabel>Current</StreakLabel>
        </StreakItem>
        <StreakItem>
          <StreakNumber>{bestStreak}</StreakNumber>
          <StreakLabel>Best</StreakLabel>
        </StreakItem>
      </StreakNumbers>
    </StreakContainer>
  );
};

