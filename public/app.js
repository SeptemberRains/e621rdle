const { useState, useEffect, useCallback } = React;

// Character Card Component
const CharacterCard = ({ character, onClick, revealed, isCorrect, isSelected, isGrayedOut, disabled }) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(character);
    }
  };

  const getCardClass = () => {
    let classes = 'character-card';
    if (disabled) classes += ' disabled';
    if (revealed) {
      classes += ' revealed';
      if (isGrayedOut) {
        classes += ' grayed-out';
      } else if (isCorrect !== null) {
        classes += isCorrect ? ' correct' : ' incorrect';
      }
    }
    return classes;
  };

  return (
    <div className={getCardClass()} onClick={handleClick}>
      <div className="character-image">
        {character.image_url ? (
          <img 
            src={character.image_url} 
            alt={character.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = 'Image not available';
            }}
          />
        ) : (
          'Image not available'
        )}
      </div>
      <div className="character-name">{character.name.replace(/_/g, ' ')}</div>
      {revealed && (
        <div className="post-count">
          {character.post_count.toLocaleString()} posts
        </div>
      )}
    </div>
  );
};

// Streak Display Component
const StreakDisplay = ({ currentStreak, bestStreak }) => {
  return (
    <div className="streak-display">
      <h3>Your Streaks</h3>
      <div className="streak-numbers">
        <div className="streak-item">
          <span className="streak-number">{currentStreak}</span>
          <span className="streak-label">Current</span>
        </div>
        <div className="streak-item">
          <span className="streak-number">{bestStreak}</span>
          <span className="streak-label">Best</span>
        </div>
      </div>
    </div>
  );
};

// Game Over Component
const GameOver = ({ currentStreak, bestStreak, onRestart }) => {
  return (
    <div className="game-over">
      <h2>Game Over!</h2>
      <p>You got {currentStreak} correct in a row!</p>
      {currentStreak === bestStreak && currentStreak > 0 && (
        <p><strong>New personal best! 🎉</strong></p>
      )}
      <button className="btn" onClick={onRestart}>
        Play Again
      </button>
    </div>
  );
};

// Result Message Component
const ResultMessage = ({ isCorrect, winner, loser, onNext }) => {
  return (
    <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
      {isCorrect ? (
        <div>
          <h3>Correct! 🎉</h3>
          <p>
            <strong>{winner.name.replace(/_/g, ' ')}</strong> has{' '}
            <strong>{winner.post_count.toLocaleString()}</strong> posts, while{' '}
            <strong>{loser.name.replace(/_/g, ' ')}</strong> has{' '}
            <strong>{loser.post_count.toLocaleString()}</strong> posts.
          </p>
        </div>
      ) : (
        <div>
          <h3>Wrong! ❌</h3>
          <p>
            <strong>{winner.name.replace(/_/g, ' ')}</strong> actually has{' '}
            <strong>{winner.post_count.toLocaleString()}</strong> posts, while{' '}
            <strong>{loser.name.replace(/_/g, ' ')}</strong> has{' '}
            <strong>{loser.post_count.toLocaleString()}</strong> posts.
          </p>
        </div>
      )}
      <button className="btn" onClick={onNext} style={{ marginTop: '15px' }}>
        {isCorrect ? 'Next Round' : 'Try Again'}
      </button>
    </div>
  );
};

// Main Game Component
const Game = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'revealed', 'gameOver'
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);

  // Load best streak from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('e621rdle-best-streak');
    if (saved) {
      setBestStreak(parseInt(saved, 10));
    }
  }, []);

  // Save best streak to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('e621rdle-best-streak', bestStreak.toString());
  }, [bestStreak]);

  // Update body background color based on game state
  useEffect(() => {
    const body = document.body;
    
    // Remove any existing answer classes
    body.classList.remove('correct-answer', 'incorrect-answer');
    
    // Add appropriate class when answer is revealed
    if (gameState === 'revealed' && isCorrect !== null) {
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
  const fetchRound = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/get-round');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length !== 2) {
        throw new Error('Invalid response format');
      }
      
      setCharacters(data);
      setGameState('playing');
      setSelectedCharacter(null);
      setIsCorrect(null);
    } catch (err) {
      console.error('Error fetching round:', err);
      setError('Failed to load new round. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize game
  useEffect(() => {
    fetchRound();
  }, [fetchRound]);

  // Handle character selection
  const handleCharacterSelect = (character) => {
    if (gameState !== 'playing') return;

    setSelectedCharacter(character);
    
    // Determine if the guess is correct
    const otherCharacter = characters.find(c => c.id !== character.id);
    const correct = character.post_count > otherCharacter.post_count;
    
    setIsCorrect(correct);
    setGameState('revealed');

    if (correct) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      setCurrentStreak(0);
      // Don't immediately show game over, let them see the result first
    }
  };

  // Handle next round or game over
  const handleNext = () => {
    if (isCorrect) {
      fetchRound(); // Start new round
    } else {
      setGameState('gameOver'); // Show game over screen
    }
  };

  // Restart game
  const handleRestart = () => {
    setCurrentStreak(0);
    fetchRound();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="game-container">
        <div className="loading">Loading new round...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="game-container">
        <div className="error">
          {error}
          <br />
          <button className="btn" onClick={fetchRound} style={{ marginTop: '15px' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render game over state
  if (gameState === 'gameOver') {
    return (
      <div className="game-container">
        <div className="header">
          <h1>e621rdle</h1>
          <p>Which character has more posts on e621.net?</p>
        </div>
        <StreakDisplay currentStreak={currentStreak} bestStreak={bestStreak} />
        <GameOver 
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  // Main game render
  const winner = characters.find(c => c.post_count === Math.max(...characters.map(ch => ch.post_count)));
  const loser = characters.find(c => c !== winner);

  return (
    <div className="game-container">
      <div className="header">
        <h1>e621rdle</h1>
        <p>Which character has more posts on e621.net?</p>
      </div>

      <StreakDisplay currentStreak={currentStreak} bestStreak={bestStreak} />

      <div className="game-board">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onClick={handleCharacterSelect}
            revealed={gameState === 'revealed'}
            isCorrect={gameState === 'revealed' && character.id === selectedCharacter?.id ? isCorrect : null}
            isGrayedOut={gameState === 'revealed' && character.id !== selectedCharacter?.id}
            isSelected={selectedCharacter?.id === character.id}
            disabled={gameState !== 'playing'}
          />
        ))}
      </div>

      {gameState === 'revealed' && (
        <ResultMessage
          isCorrect={isCorrect}
          winner={winner}
          loser={loser}
          onNext={handleNext}
        />
      )}

      <div className="game-controls">
        <button className="btn secondary" onClick={fetchRound}>
          Skip Round
        </button>
      </div>
    </div>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Game />);
