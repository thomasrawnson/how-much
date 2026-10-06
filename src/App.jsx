import React, { useState } from 'react';
import './styles.css';

const pairs = [
  {
    left: {
      name: 'Tesco British Whole Milk',
      packSize: '4 pints / 2.272L',
      price: 165,
    },
    right: {
      name: 'Heinz Beanz in Tomato Sauce',
      packSize: '415g',
      price: 140,
    },
  },
  {
    left: {
      name: "Kellogg's Corn Flakes",
      packSize: '450g',
      price: 245,
    },
    right: {
      name: 'Lurpak Slightly Salted Spreadable',
      packSize: '250g',
      price: 315,
    },
  },
  {
    left: {
      name: 'Cathedral City Mature Cheddar',
      packSize: '350g',
      price: 350,
    },
    right: {
      name: 'Tesco British Whole Milk',
      packSize: '4 pints / 2.272L',
      price: 165,
    },
  },
  {
    left: {
      name: 'Heinz Beanz in Tomato Sauce',
      packSize: '415g',
      price: 140,
    },
    right: {
      name: "Kellogg's Corn Flakes",
      packSize: '450g',
      price: 245,
    },
  },
  {
    left: {
      name: 'Lurpak Slightly Salted Spreadable',
      packSize: '250g',
      price: 315,
    },
    right: {
      name: 'Cathedral City Mature Cheddar',
      packSize: '350g',
      price: 350,
    },
  },
];

function formatPrice(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatTime(milliseconds) {
  if (!milliseconds) return '0.0s';
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

function getSummary(score) {
  if (score === 5) return 'Supermarket savant.';
  if (score === 4) return 'Very in touch with the weekly shop.';
  if (score === 3) return 'Solid trolley knowledge.';
  if (score === 2) return 'A few surprises in aisle three.';
  return 'When did you last go shopping?';
}

function getShareLine(score) {
  if (score === 5) return 'Perfect shop.';
  if (score === 4) return 'Defeated by one sneaky item.';
  if (score === 3) return 'Respectable trolley knowledge.';
  if (score === 2) return 'The supermarket fought back.';
  return 'Apparently I do not know what anything costs.';
}

function App() {
  const [screen, setScreen] = useState('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedSide, setSelectedSide] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [shareStatus, setShareStatus] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [finishTime, setFinishTime] = useState(null);

  const elapsedTime =
    startTime && finishTime
      ? finishTime - startTime
      : 0;

  const pair = pairs[currentQuestion];

  const correctSide =
    pair.left.price > pair.right.price ? 'left' : 'right';

  const isCorrect = selectedSide === correctSide;

  const handleChoice = (side) => {
    if (selectedSide !== null) return;

    const correct = side === correctSide;

    setSelectedSide(side);
    setAnswers((current) => [...current, correct]);

    if (correct) {
      setScore((currentScore) => currentScore + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < pairs.length - 1) {
      setCurrentQuestion((question) => question + 1);
      setSelectedSide(null);
    } else {
      setFinishTime(Date.now());
      setScreen('results');
    }
  };

  const handleRestart = () => {
    setScreen('landing');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedSide(null);
    setAnswers([]);
    setShareStatus('');
    setStartTime(null);
    setFinishTime(null);
  };

  const getCardClass = (side) => {
    if (selectedSide === null) return 'product-choice';

    if (side === correctSide) {
      return 'product-choice correct';
    }

    if (side === selectedSide && side !== correctSide) {
      return 'product-choice wrong';
    }

    return 'product-choice muted';
  };

  const resultPattern = answers
    .map((answer) => (answer ? '🟩' : '🟥'))
    .join('');

  const shareText = `How Much?! — Weekly Shop

${score}/5 · ${formatTime(elapsedTime)}
${resultPattern}

${getShareLine(score)}

Think you can beat me?`;

  const handleShare = async () => {
    setShareStatus('');

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'How Much?! — Weekly Shop',
          text: shareText,
        });

        setShareStatus('Shared.');
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareStatus('Result copied.');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setShareStatus('Could not share. Try again.');
      }
    }
  };

  if (screen === 'landing') {
    return (
      <div className="app landing-screen">
        <div className="eyebrow">WEEKLY SHOP</div>

        <h1>How Much?!</h1>

        <p className="hero-copy">
          Which one costs more?
        </p>

        <p className="sub-copy">
          5 pairs. About 30 seconds.
        </p>

        <button
          className="primary-button"
          onClick={() => {
            setStartTime(Date.now());
            setFinishTime(null);
            setScreen('question');
          }}
        >
          Play
        </button>
      </div>
    );
  }

  if (screen === 'results') {
    return (
      <div className="app results-screen">
        <div className="eyebrow">WEEKLY SHOP</div>

        <h1>{score} / 5</h1>

        <p className="result-time">
          {formatTime(elapsedTime)}
        </p>

        <div className="result-grid" aria-label="Question results">
          {answers.map((answer, index) => (
            <div
              key={index}
              className={answer ? 'result-tile correct-tile' : 'result-tile wrong-tile'}
            >
              {answer ? '✓' : '×'}
            </div>
          ))}
        </div>

        <p className="result-summary">
          {getSummary(score)}
        </p>

        <div className="result-actions">
          <button
            className="primary-button"
            onClick={handleShare}
          >
            Share Result
          </button>

          <button
            className="secondary-button"
            onClick={handleRestart}
          >
            Play Again
          </button>
        </div>

        {shareStatus && (
          <p className="share-status">
            {shareStatus}
          </p>
        )}

        <div className="share-preview">
          <span className="share-preview-label">Share preview</span>
          <strong>{score}/5 · {formatTime(elapsedTime)}</strong>
          <span>{resultPattern}</span>
          <span>{getShareLine(score)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="top-row">
        <span className="eyebrow">WEEKLY SHOP</span>
        <span className="question-count">
          {currentQuestion + 1} / {pairs.length}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${((currentQuestion + 1) / pairs.length) * 100}%`,
          }}
        />
      </div>

      <h2>Which costs more?</h2>

      <div className="comparison">
        <button
          className={getCardClass('left')}
          onClick={() => handleChoice('left')}
          disabled={selectedSide !== null}
        >
          <strong>{pair.left.name}</strong>
          <span>{pair.left.packSize}</span>

          {selectedSide !== null && (
            <span className="price">
              {formatPrice(pair.left.price)}
            </span>
          )}
        </button>

        <div className="versus">VS</div>

        <button
          className={getCardClass('right')}
          onClick={() => handleChoice('right')}
          disabled={selectedSide !== null}
        >
          <strong>{pair.right.name}</strong>
          <span>{pair.right.packSize}</span>

          {selectedSide !== null && (
            <span className="price">
              {formatPrice(pair.right.price)}
            </span>
          )}
        </button>
      </div>

      {selectedSide !== null && (
        <div className="reveal">
          <div className={isCorrect ? 'feedback correct-text' : 'feedback wrong-text'}>
            {isCorrect ? 'Correct' : 'Nope'}
          </div>

          <p>
            {formatPrice(Math.abs(pair.left.price - pair.right.price))} difference
          </p>

          <button className="primary-button" onClick={handleNext}>
            {currentQuestion === pairs.length - 1
              ? 'See Result'
              : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
