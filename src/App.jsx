import React, { useState } from 'react';
import './styles.css';

import milkImg from './assets/milk.svg';
import beansImg from './assets/beans.svg';
import cerealImg from './assets/cereal.svg';
import lurpakImg from './assets/lurpak.svg';
import cheeseImg from './assets/cheese.svg';

const PRICE_CHECKED_DATE = '4 Oct 2026';

const products = {
  milk: { name: 'Tesco British Whole Milk', packSize: '4 pints / 2.272L', price: 165, image: milkImg, imageAlt: 'Illustration of a milk bottle' },
  beans: { name: 'Heinz Beanz in Tomato Sauce', packSize: '415g', price: 140, image: beansImg, imageAlt: 'Illustration of a tin of beans' },
  cereal: { name: "Kellogg's Corn Flakes", packSize: '450g', price: 245, image: cerealImg, imageAlt: 'Illustration of a cereal box' },
  lurpak: { name: 'Lurpak Slightly Salted Spreadable', packSize: '250g', price: 315, image: lurpakImg, imageAlt: 'Illustration of a butter tub' },
  cheese: { name: 'Cathedral City Mature Cheddar', packSize: '350g', price: 350, image: cheeseImg, imageAlt: 'Illustration of a block of cheddar' },
};

const pairs = [
  { left: products.milk, right: products.beans },
  { left: products.cereal, right: products.lurpak },
  { left: products.cheese, right: products.milk },
  { left: products.beans, right: products.cereal },
  { left: products.lurpak, right: products.cheese },
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

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStoredStreak() {
  if (typeof window === 'undefined') return 0;
  return Number.parseInt(window.localStorage.getItem('how-much-streak') || '0', 10);
}

function updateDailyStreak() {
  if (typeof window === 'undefined') return 0;

  const today = new Date();
  const todayKey = localDateKey(today);
  const previousKey = window.localStorage.getItem('how-much-last-play-date');
  const currentStreak = getStoredStreak();

  if (previousKey === todayKey) return currentStreak || 1;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday);

  const nextStreak = previousKey === yesterdayKey ? Math.max(1, currentStreak + 1) : 1;

  window.localStorage.setItem('how-much-last-play-date', todayKey);
  window.localStorage.setItem('how-much-streak', String(nextStreak));
  return nextStreak;
}

function ProductCard({ product, side, selectedSide, correctSide, onChoose }) {
  const revealed = selectedSide !== null;
  let stateClass = '';
  if (revealed) {
    if (side === correctSide) stateClass = ' correct';
    else if (side === selectedSide) stateClass = ' wrong';
    else stateClass = ' muted';
  }

  return (
    <button className={`product-choice${stateClass}`} onClick={() => onChoose(side)} disabled={revealed}>
      <div className="product-image-wrap">
        <img className="product-image" src={product.image} alt={product.imageAlt} />
      </div>
      <div className="product-copy">
        <strong>{product.name}</strong>
        <span>{product.packSize}</span>
        {revealed && <span className="price">{formatPrice(product.price)}</span>}
      </div>
    </button>
  );
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
  const [streak, setStreak] = useState(() => getStoredStreak());

  const elapsedTime = startTime && finishTime ? finishTime - startTime : 0;
  const pair = pairs[currentQuestion];
  const correctSide = pair.left.price > pair.right.price ? 'left' : 'right';
  const isCorrect = selectedSide === correctSide;

  const handleChoice = (side) => {
    if (selectedSide !== null) return;
    const correct = side === correctSide;
    setSelectedSide(side);
    setAnswers((current) => [...current, correct]);
    if (correct) setScore((currentScore) => currentScore + 1);
  };

  const handleNext = () => {
    if (currentQuestion < pairs.length - 1) {
      setCurrentQuestion((question) => question + 1);
      setSelectedSide(null);
    } else {
      setFinishTime(Date.now());
      setStreak(updateDailyStreak());
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

  const resultPattern = answers.map((answer) => (answer ? '🟩' : '🟥')).join('');

  const shareText = `How Much?! — Weekly Shop\n\n${score}/5 · ${formatTime(elapsedTime)}\n${resultPattern}\n🔥 ${streak} day streak\n\n${getShareLine(score)}\n\nThink you can beat me?`;

  const handleShare = async () => {
    setShareStatus('');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'How Much?! — Weekly Shop', text: shareText });
        setShareStatus('Shared.');
        return;
      }
      await navigator.clipboard.writeText(shareText);
      setShareStatus('Result copied.');
    } catch (error) {
      if (error?.name !== 'AbortError') setShareStatus('Could not share. Try again.');
    }
  };

  if (screen === 'landing') {
    return (
      <div className="app landing-screen">
        <div className="receipt-header">
          <span className="eyebrow">WEEKLY SHOP</span>
          <span className="streak-chip">🔥 {streak} day streak</span>
        </div>
        <h1>How Much?!</h1>
        <p className="hero-copy">Which one costs more?</p>
        <p className="sub-copy">5 pairs. About 30 seconds.</p>
        <div className="price-source">Tesco · Prices checked {PRICE_CHECKED_DATE}</div>
        <div className="basket-preview" aria-hidden="true">
          <img src={milkImg} alt="" /><img src={beansImg} alt="" /><img src={cerealImg} alt="" /><img src={lurpakImg} alt="" /><img src={cheeseImg} alt="" />
        </div>
        <button className="primary-button" onClick={() => { setStartTime(Date.now()); setFinishTime(null); setScreen('question'); }}>
          Start the shop
        </button>
        <div className="receipt-footer"><span>5 comparisons</span><span>•</span><span>1 tap each</span><span>•</span><span>0–5 score</span></div>
      </div>
    );
  }

  if (screen === 'results') {
    return (
      <div className="app results-screen">
        <div className="receipt-header">
          <span className="eyebrow">YOUR RECEIPT</span>
          <span className="streak-chip">🔥 {streak} day streak</span>
        </div>
        <h1>{score} / 5</h1>
        <p className="result-time">{formatTime(elapsedTime)}</p>
        <div className="result-grid" aria-label="Question results">
          {answers.map((answer, index) => <div key={index} className={answer ? 'result-tile correct-tile' : 'result-tile wrong-tile'}>{answer ? '✓' : '×'}</div>)}
        </div>
        <p className="result-summary">{getSummary(score)}</p>
        <div className="price-source result-source">Tesco · Prices checked {PRICE_CHECKED_DATE}</div>
        <div className="result-actions">
          <button className="primary-button" onClick={handleShare}>Share Result</button>
          <button className="secondary-button" onClick={handleRestart}>Play Again</button>
        </div>
        {shareStatus && <p className="share-status">{shareStatus}</p>}
        <div className="share-preview">
          <span className="share-preview-label">Share preview</span>
          <strong>{score}/5 · {formatTime(elapsedTime)}</strong>
          <span>{resultPattern}</span>
          <span>🔥 {streak} day streak</span>
          <span>{getShareLine(score)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="receipt-header"><span className="eyebrow">WEEKLY SHOP</span><span className="question-count">{currentQuestion + 1} / {pairs.length}</span></div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${((currentQuestion + 1) / pairs.length) * 100}%` }} /></div>
      <div className="price-source question-source">Tesco · Prices checked {PRICE_CHECKED_DATE}</div>
      <h2>Which costs more?</h2>
      <div className="comparison">
        <ProductCard product={pair.left} side="left" selectedSide={selectedSide} correctSide={correctSide} onChoose={handleChoice} />
        <div className="versus">VS</div>
        <ProductCard product={pair.right} side="right" selectedSide={selectedSide} correctSide={correctSide} onChoose={handleChoice} />
      </div>
      {selectedSide !== null && (
        <div className="reveal">
          <div className={isCorrect ? 'feedback correct-text' : 'feedback wrong-text'}>{isCorrect ? 'Correct — nice spot.' : 'Not quite.'}</div>
          <p>{formatPrice(Math.abs(pair.left.price - pair.right.price))} difference</p>
          <button className="primary-button" onClick={handleNext}>{currentQuestion === pairs.length - 1 ? 'See Receipt' : 'Next Aisle'}</button>
        </div>
      )}
    </div>
  );
}

export default App;
