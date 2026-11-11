import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, RotateCcw, Award, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { evaluateCognitivePerformance } from '../utils/aiEngine';

const CARD_SETS = {
  easy: [
    { id: 1, symbol: '🍎', name: 'Apple' },
    { id: 2, symbol: '🌻', name: 'Sunflower' },
    { id: 3, symbol: '🐶', name: 'Puppy' },
    { id: 4, symbol: '⭐', name: 'Star' }
  ],
  medium: [
    { id: 1, symbol: '🍎', name: 'Apple' },
    { id: 2, symbol: '🌻', name: 'Sunflower' },
    { id: 3, symbol: '🐶', name: 'Puppy' },
    { id: 4, symbol: '⭐', name: 'Star' },
    { id: 5, symbol: '🍓', name: 'Strawberry' },
    { id: 6, symbol: '🕊️', name: 'Dove' }
  ],
  hard: [
    { id: 1, symbol: '🍎', name: 'Apple' },
    { id: 2, symbol: '🌻', name: 'Sunflower' },
    { id: 3, symbol: '🐶', name: 'Puppy' },
    { id: 4, symbol: '⭐', name: 'Star' },
    { id: 5, symbol: '🍓', name: 'Strawberry' },
    { id: 6, symbol: '🕊️', name: 'Dove' },
    { id: 7, symbol: '🔔', name: 'Bell' },
    { id: 8, symbol: '⛵', name: 'Sailboat' }
  ]
};

export const MemoryMatchGame = ({ initialDifficulty = 'easy', onGameComplete, onExit }) => {
  const { speak } = useAccessibility();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Initialize deck
  const setupGame = (diff = difficulty) => {
    const baseCards = CARD_SETS[diff] || CARD_SETS.easy;
    // Duplicate each card for pairs
    const deck = [];
    baseCards.forEach((c) => {
      deck.push({ ...c, uniqueId: `${c.id}-a` });
      deck.push({ ...c, uniqueId: `${c.id}-b` });
    });
    // Shuffle
    deck.sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setErrors(0);
    setTimerSeconds(0);
    setIsGameOver(false);
    setAiResult(null);

    speak(`Memory Match game started at ${diff} difficulty. Find matching pairs.`);
  };

  useEffect(() => {
    setupGame(difficulty);
  }, [difficulty]);

  // Timer loop
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2) return;
    if (flippedIndices.includes(index)) return;
    if (matchedIds.includes(cards[index].id)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // If second card flipped
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.id === secondCard.id) {
        // Match!
        const newMatched = [...matchedIds, firstCard.id];
        setMatchedIds(newMatched);
        setFlippedIndices([]);
        speak(`Match found! ${firstCard.name}`);

        // Check if all matched
        const totalPairs = (CARD_SETS[difficulty] || CARD_SETS.easy).length;
        if (newMatched.length === totalPairs) {
          handleGameOver(newMatched.length, errors, timerSeconds + 1);
        }
      } else {
        // Miss
        setErrors(e => e + 1);
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  const handleGameOver = (correctPairs, errorCount, timeSec) => {
    setIsGameOver(true);
    // Confetti celebration
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const baseScore = 500;
    const timeBonus = Math.max(0, 300 - timeSec * 4);
    const accuracyBonus = Math.max(0, 200 - errorCount * 25);
    const totalScore = baseScore + timeBonus + accuracyBonus;

    const evaluation = evaluateCognitivePerformance({
      score: totalScore,
      correct: correctPairs,
      incorrect: errorCount,
      timeSeconds: timeSec,
      currentDifficulty: difficulty
    });

    setAiResult(evaluation);
    speak(`${evaluation.feedbackMessage}. ${evaluation.aiReasoning}`);

    if (onGameComplete) {
      onGameComplete({
        gameType: 'memory',
        gameTitle: 'Memory Card Flip Match',
        difficulty,
        score: totalScore,
        correctAnswers: correctPairs,
        incorrectAnswers: errorCount,
        completionTimeSeconds: timeSec,
        accuracy: evaluation.accuracy,
        streak: 1,
        aiRecommendation: evaluation.aiReasoning
      });
    }
  };

  return (
    <div className="card" style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--blue-900)' }}>
            Memory Card Flip Match
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Tap cards to flip and match pairs. Take your time!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Difficulty selector */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-card-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            {['easy', 'medium', 'hard'].map((lvl) => (
              <button
                key={lvl}
                className={`btn btn-sm ${difficulty === lvl ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.75rem', textTransform: 'capitalize', border: 'none' }}
                onClick={() => setDifficulty(lvl)}
                disabled={isGameOver}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button className="btn btn-outline btn-sm" onClick={() => setupGame()} title="Restart game">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: 'var(--blue-50)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        fontSize: '1rem',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--blue-700)' }}>
          <Clock size={18} /> Time: {timerSeconds}s
        </div>
        <div style={{ color: 'var(--green-700)' }}>
          Pairs: {matchedIds.length} / {(CARD_SETS[difficulty] || CARD_SETS.easy).length}
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          Tries: {moves}
        </div>
      </div>

      {/* Game Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: difficulty === 'hard' ? 'repeat(4, 1fr)' : difficulty === 'medium' ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)',
        gap: '0.85rem',
        marginBottom: '1.5rem'
      }}>
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || matchedIds.includes(card.id);
          const isMatched = matchedIds.includes(card.id);

          return (
            <button
              key={card.uniqueId}
              onClick={() => handleCardClick(index)}
              disabled={isMatched || isGameOver}
              style={{
                height: '100px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isMatched ? 'var(--green-100)' : isFlipped ? 'var(--blue-100)' : 'var(--blue-500)',
                border: `2px solid ${isMatched ? 'var(--green-500)' : isFlipped ? 'var(--blue-300)' : 'var(--blue-600)'}`,
                color: '#fff',
                fontSize: isFlipped ? '2.5rem' : '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease',
                transform: isFlipped ? 'scale(1.02)' : 'none',
                cursor: isMatched ? 'default' : 'pointer'
              }}
              aria-label={isFlipped ? card.name : `Card ${index + 1}`}
            >
              {isFlipped ? card.symbol : '❓'}
            </button>
          );
        })}
      </div>

      {/* Game Completed Banner / AI Feedback */}
      {isGameOver && aiResult && (
        <div style={{
          backgroundColor: 'var(--green-50)',
          border: '2px solid var(--green-300)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          textAlign: 'center',
          animation: 'fadeIn 0.4s ease'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--green-500)',
            color: '#fff',
            marginBottom: '0.75rem'
          }}>
            <Award size={32} />
          </div>

          <h3 style={{ fontSize: '1.6rem', color: 'var(--green-800)', marginBottom: '0.4rem' }}>
            {aiResult.feedbackMessage}
          </h3>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Completed in <strong>{timerSeconds} seconds</strong> with <strong>{moves} tries</strong> (Accuracy: {aiResult.accuracy}%).
          </p>

          <div style={{
            backgroundColor: '#fff',
            border: '1.5px dashed var(--green-500)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--blue-700)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              🧠 AI Cognitive Adaptation Feedback:
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {aiResult.aiReasoning}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button 
              className="btn btn-success btn-lg"
              onClick={() => {
                setDifficulty(aiResult.nextDifficulty);
                setupGame(aiResult.nextDifficulty);
              }}
            >
              Play Next Level ({aiResult.nextDifficulty})
            </button>

            <button className="btn btn-outline" onClick={() => setupGame(difficulty)}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
