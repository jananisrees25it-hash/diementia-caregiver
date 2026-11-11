import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Award, CheckCircle2, Clock } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { evaluateCognitivePerformance } from '../utils/aiEngine';

export const NumberCrunchGame = ({ initialDifficulty = 'easy', onGameComplete }) => {
  const { speak } = useAccessibility();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [puzzleData, setPuzzleData] = useState(null);
  const [userSelection, setUserSelection] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [errors, setErrors] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  const generatePuzzle = (diff = difficulty) => {
    setDifficulty(diff);
    setIsWon(false);
    setUserSelection([]);
    setErrors(0);
    setTimerSeconds(0);
    setAiResult(null);

    if (diff === 'easy') {
      // Ascending number ordering
      const set = new Set();
      while (set.size < 4) {
        set.add(Math.floor(Math.random() * 50) + 1);
      }
      const numbers = Array.from(set);
      const sorted = [...numbers].sort((a, b) => a - b);
      // Shuffle for display
      const shuffled = [...numbers].sort(() => Math.random() - 0.5);

      setPuzzleData({
        type: 'order',
        question: 'Tap the numbers in order from lowest to highest:',
        shuffled,
        sorted
      });
      speak("Tap the numbers in order from lowest to highest.");
    } else if (diff === 'medium') {
      // Complete arithmetic sequence
      const step = Math.floor(Math.random() * 5) + 2; // e.g., 2, 3, 4, 5
      const start = Math.floor(Math.random() * 20) + 2;
      const seq = [start, start + step, start + step * 2, start + step * 3];
      const answer = seq[3];
      const options = [answer, answer + step, answer - 1, answer + 2].sort(() => Math.random() - 0.5);

      setPuzzleData({
        type: 'sequence',
        question: `Find the next number: ${seq[0]}, ${seq[1]}, ${seq[2]}, ___ ?`,
        options,
        answer
      });
      speak(`Find the next number in the pattern: ${seq[0]}, ${seq[1]}, ${seq[2]}.`);
    } else {
      // Friendly math sum
      const num1 = Math.floor(Math.random() * 25) + 10;
      const num2 = Math.floor(Math.random() * 20) + 5;
      const answer = num1 + num2;
      const options = [answer, answer + 10, answer - 2, answer + 3].sort(() => Math.random() - 0.5);

      setPuzzleData({
        type: 'math',
        question: `What is ${num1} + ${num2} ?`,
        options,
        answer
      });
      speak(`What is ${num1} plus ${num2}?`);
    }
  };

  useEffect(() => {
    generatePuzzle(difficulty);
  }, [difficulty]);

  useEffect(() => {
    let interval;
    if (!isWon) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isWon]);

  // Handle tap for 'order' puzzle
  const handleOrderClick = (num) => {
    if (isWon || userSelection.includes(num)) return;

    const expectedNext = puzzleData.sorted[userSelection.length];
    if (num === expectedNext) {
      const nextSelection = [...userSelection, num];
      setUserSelection(nextSelection);
      speak(`${num}`);

      if (nextSelection.length === puzzleData.sorted.length) {
        handleVictory();
      }
    } else {
      setErrors(e => e + 1);
      speak(`Not quite. Try finding the lowest remaining number.`);
    }
  };

  // Handle multiple-choice option click
  const handleChoiceClick = (choice) => {
    if (isWon) return;

    if (choice === puzzleData.answer) {
      speak(`Correct! ${choice} is right.`);
      handleVictory();
    } else {
      setErrors(e => e + 1);
      speak(`Let's think again. Take your time.`);
    }
  };

  const handleVictory = () => {
    setIsWon(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const baseScore = 650;
    const timeBonus = Math.max(0, 250 - timerSeconds * 6);
    const errorPenalty = errors * 40;
    const totalScore = Math.max(150, baseScore + timeBonus - errorPenalty);

    const evaluation = evaluateCognitivePerformance({
      score: totalScore,
      correct: 1,
      incorrect: errors,
      timeSeconds: timerSeconds,
      currentDifficulty: difficulty
    });

    setAiResult(evaluation);
    speak(`${evaluation.feedbackMessage}. ${evaluation.aiReasoning}`);

    if (onGameComplete) {
      onGameComplete({
        gameType: 'number',
        gameTitle: 'Number Sequence Crunch',
        difficulty,
        score: totalScore,
        correctAnswers: 1,
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
          <h2 style={{ fontSize: '1.5rem', color: 'var(--blue-900)' }}>Number Sequence Crunch</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Exercise arithmetic recall & numerical ordering.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-card-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          {['easy', 'medium', 'hard'].map((lvl) => (
            <button
              key={lvl}
              className={`btn btn-sm ${difficulty === lvl ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.75rem', textTransform: 'capitalize', border: 'none' }}
              onClick={() => generatePuzzle(lvl)}
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
        backgroundColor: 'var(--blue-50)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        fontWeight: 600
      }}>
        <div style={{ color: 'var(--blue-700)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={18} /> {timerSeconds}s
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          Errors: {errors}
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => generatePuzzle(difficulty)}>
          <RotateCcw size={16} /> New Puzzle
        </button>
      </div>

      {/* Question Card */}
      {puzzleData && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--blue-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--blue-900)', marginBottom: '1.25rem' }}>
            {puzzleData.question}
          </h3>

          {/* If ordering numbers */}
          {puzzleData.type === 'order' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {puzzleData.shuffled.map((num) => {
                  const isSelected = userSelection.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => handleOrderClick(num)}
                      disabled={isSelected || isWon}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        backgroundColor: isSelected ? 'var(--green-100)' : 'var(--blue-50)',
                        border: `2.5px solid ${isSelected ? 'var(--green-500)' : 'var(--blue-300)'}`,
                        color: isSelected ? 'var(--green-800)' : 'var(--blue-900)',
                        cursor: isSelected ? 'default' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Selected: {userSelection.length > 0 ? userSelection.join('  ➔  ') : 'Tap the smallest number first'}
              </div>
            </div>
          )}

          {/* If sequence / math options */}
          {(puzzleData.type === 'sequence' || puzzleData.type === 'math') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', maxWidth: '360px', margin: '0 auto' }}>
              {puzzleData.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChoiceClick(opt)}
                  disabled={isWon}
                  className="btn btn-outline btn-lg"
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--blue-50)',
                    borderColor: 'var(--blue-300)',
                    color: 'var(--blue-900)'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
            Solved in <strong>{timerSeconds} seconds</strong> (Accuracy: {aiResult.accuracy}%).
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
              onClick={() => generatePuzzle(aiResult.nextDifficulty)}
            >
              Play Next Level ({aiResult.nextDifficulty})
            </button>
            <button className="btn btn-outline" onClick={() => generatePuzzle(difficulty)}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
