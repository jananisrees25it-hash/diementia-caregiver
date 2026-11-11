import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Award, Play, CheckCircle2, Clock } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { evaluateCognitivePerformance } from '../utils/aiEngine';

const COLORS = [
  { id: 0, name: 'Sky Blue', bg: '#0284c7', activeBg: '#7dd3fc', border: '#0369a1' },
  { id: 1, name: 'Emerald', bg: '#10b981', activeBg: '#a7f3d0', border: '#047857' },
  { id: 2, name: 'Lavender', bg: '#8b5cf6', activeBg: '#ddd6fe', border: '#6d28d9' },
  { id: 3, name: 'Amber', bg: '#f59e0b', activeBg: '#fde68a', border: '#b45309' }
];

const TARGET_ROUNDS = {
  easy: 3,
  medium: 5,
  hard: 7
};

export const PatternSequenceGame = ({ initialDifficulty = 'easy', onGameComplete }) => {
  const { speak } = useAccessibility();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [activeColorId, setActiveColorId] = useState(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle' | 'watching' | 'turn' | 'win' | 'lose'
  const [currentRound, setCurrentRound] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [errors, setErrors] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  const maxRounds = TARGET_ROUNDS[difficulty] || 3;

  useEffect(() => {
    startNewGame(difficulty);
  }, [difficulty]);

  useEffect(() => {
    let interval;
    if (gameStatus === 'watching' || gameStatus === 'turn') {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus]);

  const startNewGame = (diff = difficulty) => {
    setDifficulty(diff);
    setCurrentRound(1);
    setErrors(0);
    setTimerSeconds(0);
    setAiResult(null);
    generateNextRound(1);
  };

  const generateNextRound = (roundNum) => {
    // Build random sequence of length roundNum
    const newSeq = [];
    for (let i = 0; i < roundNum; i++) {
      newSeq.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSeq);
    setUserStep(0);
    playSequence(newSeq);
  };

  const playSequence = async (seqToPlay) => {
    setIsPlayingSeq(true);
    setGameStatus('watching');
    speak("Watch the pattern lights carefully.");

    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < seqToPlay.length; i++) {
      const colorId = seqToPlay[i];
      setActiveColorId(colorId);
      await new Promise(r => setTimeout(r, 650));
      setActiveColorId(null);
      await new Promise(r => setTimeout(r, 250));
    }

    setIsPlayingSeq(false);
    setGameStatus('turn');
    speak("Your turn! Tap the colors in the same order.");
  };

  const handleColorClick = (colorId) => {
    if (isPlayingSeq || gameStatus !== 'turn') return;

    // Flash clicked color briefly
    setActiveColorId(colorId);
    setTimeout(() => setActiveColorId(null), 250);

    // Check match
    if (colorId === sequence[userStep]) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Finished current round?
      if (nextStep === sequence.length) {
        if (currentRound >= maxRounds) {
          // Player won the whole game!
          handleGameVictory();
        } else {
          // Advance to next round
          speak("Great job! Next round.");
          setCurrentRound(r => r + 1);
          setTimeout(() => {
            generateNextRound(currentRound + 1);
          }, 1000);
        }
      }
    } else {
      // Mistake
      setErrors(e => e + 1);
      speak("Let's try that sequence once more.");
      setUserStep(0);
      setTimeout(() => {
        playSequence(sequence);
      }, 1000);
    }
  };

  const handleGameVictory = () => {
    setGameStatus('win');
    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const baseScore = 600;
    const timeBonus = Math.max(0, 300 - timerSeconds * 5);
    const errorPenalty = errors * 40;
    const totalScore = Math.max(100, baseScore + timeBonus - errorPenalty);

    const evaluation = evaluateCognitivePerformance({
      score: totalScore,
      correct: maxRounds,
      incorrect: errors,
      timeSeconds: timerSeconds,
      currentDifficulty: difficulty
    });

    setAiResult(evaluation);
    speak(`${evaluation.feedbackMessage}. ${evaluation.aiReasoning}`);

    if (onGameComplete) {
      onGameComplete({
        gameType: 'pattern',
        gameTitle: 'Pattern Color Sequence',
        difficulty,
        score: totalScore,
        correctAnswers: maxRounds,
        incorrectAnswers: errors,
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
          <h2 style={{ fontSize: '1.5rem', color: 'var(--blue-900)' }}>Pattern Color Sequence</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Watch the glowing tiles, then repeat the pattern.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-card-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {['easy', 'medium', 'hard'].map((lvl) => (
            <button
              key={lvl}
              className={`btn btn-sm ${difficulty === lvl ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.75rem', textTransform: 'capitalize', border: 'none' }}
              onClick={() => startNewGame(lvl)}
              disabled={gameStatus === 'watching'}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Status banner */}
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
        <div style={{ color: 'var(--purple-700)' }}>
          Round: {currentRound} of {maxRounds}
        </div>
        <div style={{ color: gameStatus === 'turn' ? 'var(--green-700)' : 'var(--amber-700)' }}>
          {gameStatus === 'watching' ? '👀 Watching...' : gameStatus === 'turn' ? '👉 Your Turn!' : 'Ready'}
        </div>
      </div>

      {/* 4 Colored Buttons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        maxWidth: '380px',
        margin: '0 auto 1.5rem auto'
      }}>
        {COLORS.map((c) => {
          const isActive = activeColorId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleColorClick(c.id)}
              disabled={isPlayingSeq || gameStatus === 'win'}
              style={{
                height: '140px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isActive ? c.activeBg : c.bg,
                border: `3px solid ${c.border}`,
                boxShadow: isActive ? `0 0 25px ${c.bg}` : 'var(--shadow-md)',
                transform: isActive ? 'scale(1.05)' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#fff',
                fontSize: '1.15rem',
                fontWeight: 700,
                cursor: isPlayingSeq ? 'wait' : 'pointer'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.3)',
                boxShadow: isActive ? '0 0 10px #fff' : 'none'
              }} />
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Repeat Sequence prompt */}
      {gameStatus === 'turn' && (
        <button
          className="btn btn-outline btn-sm"
          onClick={() => playSequence(sequence)}
          style={{ marginBottom: '1.25rem' }}
        >
          <RotateCcw size={16} /> Replay This Sequence
        </button>
      )}

      {/* Victory / AI Recommendation Card */}
      {gameStatus === 'win' && aiResult && (
        <div style={{
          backgroundColor: 'var(--green-50)',
          border: '2px solid var(--green-300)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginTop: '1rem',
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
            Sequence completed in <strong>{timerSeconds} seconds</strong> (Accuracy: {aiResult.accuracy}%).
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
              onClick={() => startNewGame(aiResult.nextDifficulty)}
            >
              Play Next Level ({aiResult.nextDifficulty})
            </button>
            <button className="btn btn-outline" onClick={() => startNewGame(difficulty)}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
