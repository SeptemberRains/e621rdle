import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { Game } from './components/Game';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Verdana', 'Geneva', sans-serif;
    background: rgb(1, 46, 87);
    min-height: 100vh;
    color: rgb(255, 255, 255);
  }

  /* Ensure text stays readable on colored backgrounds */
  body.correct-answer .header,
  body.incorrect-answer .header {
    text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
  }

  body.correct-answer .streak-display,
  body.incorrect-answer .streak-display {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .game-board {
      flex-direction: column;
      gap: 20px;
    }
    
    .character-card {
      max-width: 100%;
      min-width: auto;
    }
    
    .header h1 {
      font-size: 2rem;
    }
    
    .streak-numbers {
      gap: 20px;
    }
    
    .streak-number {
      font-size: 1.5rem;
    }
  }
`;

export const App: React.FC = () => {
  return (
    <React.Fragment>
      {/* @ts-expect-error: Suppress GlobalStyle JSX issue */}
      <GlobalStyle />
      <Game />
    </React.Fragment>
  );
};

