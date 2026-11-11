import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Award, HelpCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { evaluateCognitivePerformance } from '../utils/aiEngine';

const WORD_DICTIONARY = {
  easy: [
    { word: 'GARDEN', clue: 'A peaceful outdoor place with plants, flowers, and fresh air.' },
    { word: 'FAMILY', clue: 'People who love and support each other unconditionally.' },
    { word: 'SUNNY', clue: 'A bright day filled with pleasant daylight.' }
  ],
  medium: [
    { word: 'MORNING', clue: 'The early part of the day when daylight begins.' },
    { word: 'KITCHEN', clue: 'The warm room where meals are prepared.' },
    { word: 'HARMONY', clue: 'A state of peaceful agreement and melody.' }
  ],
  hard: [
    { word: 'SUNSHINE', clue: 'Warm, golden natural light shining down from the sky.' },
    { word: 'KINDNESS', clue: 'The quality of being friendly, generous, and considerate.' },
    { word: 'MEMORIES', clue: 'Precious moments and experiences cherished in the mind.' }
  ]
};

export const WordRecallGame = ({ initialDifficulty = 'easy', onGameComplete }) => {
  const { speak } = useAccessibility();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [assembledLetters, setAssembledLetters] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  const initGame = (diff = difficulty) => {
    setDifficulty(diff);
    setIsWon(false);
    setAssembledLetters([]);
    setHintsUsed(0);
    setTimerSeconds(0);
    setAiResult(null);

    const list = WORD_DICTIONARY[diff] || WORD_DICTIONARY.easy;
    const item = list[Math.floor(Math.random() * list.length)];
    setCurrentPuzzle(item);

    // Scramble letters with unique IDs
    const chars = item.word.split('').map((letter, idx) => ({
      id: `${letter}-${idx}`,
      letter
    }));

    // Ensure scrambled order is different from original
    let shuffled = [...chars].sort(() => Math.random() - 0.5);
    setScrambledLetters(shuffled);

    speak(`Word exercise: ${item.clue}. Tap letters to spell the word.`);
  };

  useEffect(() => {
    initGame(difficulty);
  }, [difficulty]);

  useEffect(() => {
    let interval;
    if (!isWon) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isWon]);

  // Tap letter from pool to assemble
  const handleSelectLetter = (tile) => {
    if (isWon) return;

    const newAssembled = [...assembledLetters, tile];
    const newScrambled = scrambledLetters.filter(t => t.id !== tile.id);

    setAssembledLetters(newAssembled);
    setScrambledLetters(newScrambled);
    speak(tile.letter);

    // Check if fully assembled
    if (newAssembled.length === currentPuzzle.word.length) {
      const spelled = newAssembled.map(t => t.letter).join('');
      if (spelled === currentPuzzle.word) {
        handleVictory();
      } else {
        speak(`Close! Let's check the letters again.`);
      }
    }
  };

  // Undo / remove letter from assembled back to pool
  const handleRemoveLetter = (tile) => {
    if (isWon) return;

    setAssembledLetters(assembledLetters.filter(t => t.id !== tile.id));
    setScrambledLetters([...scrambledLetters, tile]);
  };

  const handleHint = () => {
    if (isWon || !currentPuzzle) return;
    const targetWord = currentPuzzle.word;
    const nextIndex = assembledLetters.length;

    if (nextIndex < targetWord.length) {
      const neededLetter = targetWord[nextIndex];
      const matchInScrambled = scrambledLetters.find(t => t.letter === neededLetter);

      if (matchInScrambled) {
        handleSelectLetter(matchInScrambled);
        setHintsUsed(h => h + 1);
        speak(`Hint: Next letter is ${neededLetter}`);
      }
    }
  };

  const handleVictory = () => {
    setIsWon(true);
    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const baseScore = 700;
    const timeBonus = Math.max(0, 200 - timerSeconds * 4);
    const hintPenalty = hintsUsed * 50;
    const totalScore = Math.max(200, baseScore + timeBonus - hintPenalty);

    const evaluation = evaluateCognitivePerformance({
      score: totalScore,
      correct: 1,
      incorrect: hintsUsed,
      timeSeconds: timerSeconds,
      currentDifficulty: difficulty
    });

    setAiResult(evaluation);
    speak(`Outstanding! You spelled ${currentPuzzle.word}! ${evaluation.feedbackMessage}`);

    if (onGameComplete) {
      onGameComplete({
        gameType: 'word',
        gameTitle: 'Word Recall & Association',
        difficulty,
        score: totalScore,
        correctAnswers: 1,
        incorrectAnswers: hintsUsed,
        completionTimeSeconds: timerSeconds,
        accuracy: evaluation.accuracy,
        streak: 1,
        aiRecommendation: evaluation.aiReasoning
      });
    }
  };

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--blue-900)' }}>Word Recall & Association</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Unscramble familiar everyday words with comforting clues.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-card-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {['easy', 'medium', 'hard'].map((lvl) => (
            <button
              key={lvl}
              className={`btn btn-sm ${difficulty === lvl ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.75rem', textTransform: 'capitalize', border: 'none' }}
              onClick={() => initGame(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--blue-50)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        fontWeight: 600
      }}>
        <div style={{ color: 'var(--blue-700)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={18} /> {timerSeconds}s
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleHint} disabled={isWon}>
          <HelpCircle size={16} /> Hint ({hintsUsed})
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => initGame(difficulty)}>
          <RotateCcw size={16} /> New Word
        </button>
      </div>

      {/* Clue Box */}
      {currentPuzzle && (
        <div style={{
          backgroundColor: 'var(--purple-50)',
          border: '1.5px solid var(--purple-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--purple-700)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            💡 Meaning Clue:
          </div>
          <div style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
            "{currentPuzzle.clue}"
          </div>
        </div>
      )}

      {/* Spelled Letter Slots (Assembled) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Your Spelled Word (tap letter to remove):
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          minHeight: '64px'
        }}>
          {currentPuzzle && currentPuzzle.word.split('').map((_, idx) => {
            const tile = assembledLetters[idx];
            return (
              <button
                key={idx}
                onClick={() => tile && handleRemoveLetter(tile)}
                style={{
                  width: '54px',
                  height: '60px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  backgroundColor: tile ? 'var(--blue-100)' : 'var(--bg-card-subtle)',
                  border: `2px ${tile ? 'solid var(--blue-500)' : 'dashed var(--border-color)'}`,
                  color: 'var(--blue-900)',
                  cursor: tile ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }}
              >
                {tile ? tile.letter : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrambled Available Letters */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Available Letters (tap to select):
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {scrambledLetters.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleSelectLetter(tile)}
              disabled={isWon}
              style={{
                width: '54px',
                height: '60px',
                borderRadius: 'var(--radius-md)',
                fontSize: '1.65rem',
                fontWeight: 800,
                backgroundColor: 'var(--blue-500)',
                color: '#fff',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.15s ease'
              }}
            >
              {tile.letter}
            </button>
          ))}
        </div>
      </div>

      {/* Victory Card */}
      {isWon && aiResult && (
        <div style={{
          backgroundColor: 'var(--green-50)',
          border: '2px solid var(--green-300)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          textAlign: 'center'
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

          <h3 style={{ fontSize: '1.5rem', color: 'var(--green-800)', marginBottom: '0.4rem' }}>
            {aiResult.feedbackMessage}
          </h3>

          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Spelled <strong>{currentPuzzle.word}</strong> in {timerSeconds} seconds.
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
              🧠 AI Cognitive Recommendation:
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {aiResult.aiReasoning}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-success btn-lg"
              onClick={() => initGame(aiResult.nextDifficulty)}
            >
              Play Next Level ({aiResult.nextDifficulty})
            </button>
            <button className="btn btn-outline" onClick={() => initGame(difficulty)}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
