import React from 'react';
import styled from 'styled-components';
import { CharacterCardProps } from '@/types';
import { formatCharacterName, formatPostCount } from '@/utils/gameLogic';

const CardContainer = styled.div<{
  disabled: boolean;
  revealed: boolean;
  isCorrect: boolean | null;
  isGrayedOut: boolean;
}>`
  background: ${props => {
    if (props.isGrayedOut) return 'linear-gradient(135deg, #777, #555)';
    if (props.isCorrect === true) return 'linear-gradient(135deg, #4CAF50, #45a049)';
    if (props.isCorrect === false) return 'linear-gradient(135deg, #f44336, #da190b)';
    return 'rgb(31, 60, 103)';
  }};
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  flex: 1;
  max-width: 350px;
  min-width: 300px;
  position: relative;
  overflow: hidden;
  color: ${props => {
    if (props.isGrayedOut) return '#ccc';
    if (props.isCorrect !== null) return 'white';
    return 'rgb(0, 170, 0)';
  }};
  opacity: ${props => props.disabled ? 0.7 : 1};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-5px)'};
    box-shadow: ${props => props.disabled ? '0 10px 30px rgba(0,0,0,0.2)' : '0 15px 40px rgba(0,0,0,0.3)'};
  }
`;

const CharacterImage = styled.div`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 15px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: #666;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 15px;
  }
`;

const CharacterName = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  word-wrap: break-word;
`;

const PostCount = styled.div<{ revealed: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #333;
  background: ${props => props.revealed ? 'rgba(255, 255, 255, 0.2)' : 'rgba(103, 126, 234, 0.1)'};
  padding: 10px;
  border-radius: 10px;
  margin-top: 15px;
  color: ${props => props.revealed ? 'inherit' : '#333'};
`;

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onClick,
  revealed,
  isCorrect,
  isGrayedOut,
  disabled,
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(character);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = 'Image not available';
    }
  };

  return (
    <CardContainer
      disabled={disabled}
      revealed={revealed}
      isCorrect={isCorrect}
      isGrayedOut={isGrayedOut}
      onClick={handleClick}
    >
      <CharacterImage>
        {character.image_url ? (
          <img 
            src={character.image_url} 
            alt={formatCharacterName(character.name)}
            onError={handleImageError}
          />
        ) : (
          'Image not available'
        )}
      </CharacterImage>
      <CharacterName>
        {formatCharacterName(character.name)}
      </CharacterName>
      {revealed && (
        <PostCount revealed={revealed}>
          {formatPostCount(character.post_count)} posts
        </PostCount>
      )}
    </CardContainer>
  );
};

