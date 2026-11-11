import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  Award, 
  Clock, 
  TrendingUp, 
  RotateCcw, 
  Info,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { apiRequest } from '../utils/api';
import { MemoryMatchGame } from '../games/MemoryMatchGame';
import { PatternSequenceGame } from '../games/PatternSequenceGame';
import { NumberCrunchGame } from '../games/NumberCrunchGame';
import { WordRecallGame } from '../games/WordRecallGame';

export const CognitiveGamesPage = ({ initialGameId = null, onNavigate }) => {
  const { user } = useAuth();
  const { speak } = useAccessibility();

  const [activeGame, setActiveGame] = useState(initialGameId); // null (hub) or 'memory' | 'pattern' | 'number' | 'word'
  const [recommendedLevels, setRecommendedLevels] = useState({
    memory: 'easy',
    pattern: 'easy',
    number: 'easy',
    word: 'easy'
  });
  const [recentScores, setRecentScores] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const patientId = user?._id || user?.id || 'patient_demo_1';

  // Load patient score recommendations
  const loadScoreAnalytics = async () => {
    try {
      const res = await apiRequest(`/scores?patientId=${patientId}`);
      if (res.success && res.summary) {
        if (res.summary.recommendedLevels) {
          setRecommendedLevels(res.summary.recommendedLevels);
        }
        setRecentScores(res.scores?.slice(0, 5) || []);
      }
    } catch (err) {
      console.warn('Could not load score analytics:', err);
    }
  };

  useEffect(() => {
    loadScoreAnalytics();
  }, [patientId]);

  const handleGameComplete = async (scorePayload) => {
    try {
      const res = await apiRequest('/scores', {
        method: 'POST',
        body: JSON.stringify({
          ...scorePayload,
          patientId
        })
      });

      if (res.success) {
        setToastMessage(`Game score saved (${scorePayload.score} pts)!`);
        setTimeout(() => setToastMessage(''), 4000);
        loadScoreAnalytics();
      }
    } catch (err) {
      console.error('Error saving game score:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: 'var(--green-600)',
          color: '#fff',
          padding: '0.85rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 200,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={20} /> {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, var(--purple-50) 0%, var(--blue-50) 100%)',
        border: '1.5px solid var(--purple-200)',
        padding: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--purple-700)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
            <Sparkles size={18} /> Rule-Based Adaptive Cognitive Practice
          </div>
          <h1 style={{ fontSize: '2.1rem', color: 'var(--purple-900)', marginBottom: '0.35rem' }}>
            Cognitive Brain Training Suite
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '640px' }}>
            Gentle, enjoyable memory and concentration games. The intelligent adaptation system automatically adjusts the challenge level to keep practice comforting and stimulating.
          </p>
        </div>

        {activeGame && (
          <button 
            className="btn btn-outline"
            onClick={() => setActiveGame(null)}
          >
            <ChevronLeft size={20} /> Back to All Games
          </button>
        )}
      </section>

      {/* Active Game Container */}
      {activeGame ? (
        <section>
          {activeGame === 'memory' && (
            <MemoryMatchGame 
              initialDifficulty={recommendedLevels.memory || 'easy'} 
              onGameComplete={handleGameComplete} 
              onExit={() => setActiveGame(null)}
            />
          )}

          {activeGame === 'pattern' && (
            <PatternSequenceGame 
              initialDifficulty={recommendedLevels.pattern || 'easy'} 
              onGameComplete={handleGameComplete} 
            />
          )}

          {activeGame === 'number' && (
            <NumberCrunchGame 
              initialDifficulty={recommendedLevels.number || 'easy'} 
              onGameComplete={handleGameComplete} 
            />
          )}

          {activeGame === 'word' && (
            <WordRecallGame 
              initialDifficulty={recommendedLevels.word || 'easy'} 
              onGameComplete={handleGameComplete} 
            />
          )}
        </section>
      ) : (
        /* Games Selection Hub */
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Game 1: Memory Cards */}
            <div className="card card-interactive" onClick={() => setActiveGame('memory')}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'var(--blue-100)',
                color: 'var(--blue-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1rem'
              }}>
                🎴
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--blue-900)' }}>Memory Card Match</h3>
                <span className="badge badge-blue">Rec: {recommendedLevels.memory}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Flip pairs of calming symbols and cards to stimulate short-term visual recall.
              </p>
              <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>Play Game</button>
            </div>

            {/* Game 2: Pattern Sequence */}
            <div className="card card-interactive" onClick={() => setActiveGame('pattern')}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'var(--green-100)',
                color: 'var(--green-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1rem'
              }}>
                💡
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--green-900)' }}>Pattern Color Sequence</h3>
                <span className="badge badge-green">Rec: {recommendedLevels.pattern}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Repeat illuminating color sequences to exercise working memory and sequence retention.
              </p>
              <button className="btn btn-success btn-sm" style={{ width: '100%' }}>Play Game</button>
            </div>

            {/* Game 3: Number Crunch */}
            <div className="card card-interactive" onClick={() => setActiveGame('number')}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'var(--amber-100)',
                color: 'var(--amber-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1rem'
              }}>
                🔢
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--amber-900)' }}>Number Crunch Sequence</h3>
                <span className="badge badge-amber">Rec: {recommendedLevels.number}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Order numbers and solve soothing arithmetic puzzles to maintain logical processing.
              </p>
              <button className="btn btn-outline btn-sm" style={{ width: '100%', borderColor: 'var(--amber-500)', color: 'var(--amber-800)' }}>Play Game</button>
            </div>

            {/* Game 4: Word Recall */}
            <div className="card card-interactive" onClick={() => setActiveGame('word')}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: 'var(--purple-100)',
                color: 'var(--purple-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1rem'
              }}>
                📖
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--purple-900)' }}>Word Recall & Association</h3>
                <span className="badge badge-purple">Rec: {recommendedLevels.word}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Unscramble everyday pleasant words with helpful clues to reinforce language fluency.
              </p>
              <button className="btn btn-purple btn-sm" style={{ width: '100%' }}>Play Game</button>
            </div>
          </div>

          {/* Recent Cognitive History */}
          <div className="card">
            <h2 style={{ fontSize: '1.3rem', color: 'var(--blue-900)', marginBottom: '1rem' }}>
              Your Recent Game Activity
            </h2>
            {recentScores.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Choose any game above to begin your first training session!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentScores.map(score => (
                  <div
                    key={score._id || score.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      backgroundColor: 'var(--bg-card-subtle)',
                      padding: '0.85rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginRight: '0.5rem' }}>
                        {score.gameTitle}
                      </span>
                      <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
                        {score.difficulty}
                      </span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {score.aiRecommendation}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--blue-700)' }}>🏆 {score.score} pts</span>
                      <span style={{ color: 'var(--green-700)' }}>🎯 {score.accuracy}% accuracy</span>
                      <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>⏱️ {score.completionTimeSeconds}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Prominent Medical Disclaimer */}
      <section style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1.5px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        fontSize: '0.9rem',
        color: 'var(--text-muted)'
      }}>
        <Info size={22} color="var(--blue-500)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: 'var(--text-main)' }}>Cognitive Practice Disclaimer:</strong> This suite is designed for supportive cognitive exercise, mental engagement, and routine structure. It does not measure, diagnose, or treat Alzheimer's disease, dementia, or any neurological condition. Always consult healthcare professionals for medical advice.
        </div>
      </section>
    </div>
  );
};
