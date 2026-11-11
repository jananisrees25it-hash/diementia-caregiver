const express = require('express');
const router = express.Router();
const { 
  getGameScores, 
  createGameScore, 
  updateDailyActivity,
  getDailyActivity 
} = require('../services/dataService');
const { protect } = require('../middleware/auth');

// Rule-based AI Engine helper
const generateAdaptiveRecommendation = (score, accuracy, completionTimeSeconds, currentDifficulty) => {
  let nextDifficulty = currentDifficulty;
  let reason = '';

  if (accuracy >= 90 && completionTimeSeconds <= 35) {
    if (currentDifficulty === 'easy') {
      nextDifficulty = 'medium';
      reason = 'Outstanding performance! High recall accuracy & quick reaction time. AI advanced level to Medium.';
    } else if (currentDifficulty === 'medium') {
      nextDifficulty = 'hard';
      reason = 'Exceptional focus! AI advanced level to Hard for an engaging cognitive challenge.';
    } else {
      reason = 'Mastery level maintained! Excellent cognitive reaction and accuracy on Hard difficulty.';
    }
  } else if (accuracy < 60 || completionTimeSeconds > 90) {
    if (currentDifficulty === 'hard') {
      nextDifficulty = 'medium';
      reason = 'Adjusted to Medium difficulty to provide a more comfortable and supportive pace.';
    } else if (currentDifficulty === 'medium') {
      nextDifficulty = 'easy';
      reason = 'Adjusted to Easy difficulty to build confidence and reinforce comfortable recall.';
    } else {
      reason = 'Gentle encouragement: Take your time, enjoy the process, and stay relaxed!';
    }
  } else {
    reason = 'Great steady effort! Current difficulty is well-balanced for memory exercise.';
  }

  return { nextDifficulty, recommendation: reason };
};

// @route   GET /api/scores
// @desc    Get cognitive game scores and analytics for patient
router.get('/', protect, async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' 
      ? (req.user._id || req.user.id) 
      : (req.query.patientId || req.user.patientId || 'patient_demo_1');

    const scores = await getGameScores(patientId);

    // Compute analytics
    const totalGames = scores.length;
    const avgScore = totalGames > 0 
      ? Math.round(scores.reduce((sum, s) => sum + (s.score || 0), 0) / totalGames) 
      : 0;
    const avgAccuracy = totalGames > 0 
      ? Math.round(scores.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalGames) 
      : 0;

    // Breakdown by game type
    const byType = {
      memory: scores.filter(s => s.gameType === 'memory'),
      pattern: scores.filter(s => s.gameType === 'pattern'),
      number: scores.filter(s => s.gameType === 'number'),
      word: scores.filter(s => s.gameType === 'word'),
    };

    // Calculate recommended next difficulty per game
    const recommendedLevels = {};
    ['memory', 'pattern', 'number', 'word'].forEach(type => {
      const typeScores = byType[type];
      if (typeScores.length > 0) {
        const latest = typeScores[0];
        const adapt = generateAdaptiveRecommendation(
          latest.score, 
          latest.accuracy, 
          latest.completionTimeSeconds, 
          latest.difficulty || 'easy'
        );
        recommendedLevels[type] = adapt.nextDifficulty;
      } else {
        recommendedLevels[type] = 'easy';
      }
    });

    res.json({
      success: true,
      summary: {
        totalGames,
        avgScore,
        avgAccuracy,
        recommendedLevels,
        medicalDisclaimer: 'Cognitive practice and support tool for mental engagement and routine support, not a diagnostic or medical treatment system.'
      },
      scores
    });
  } catch (err) {
    console.error('Get scores error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving cognitive scores' });
  }
});

// @route   POST /api/scores
// @desc    Record a completed cognitive game session
router.post('/', protect, async (req, res) => {
  try {
    const { 
      gameType, 
      gameTitle, 
      difficulty, 
      score, 
      correctAnswers, 
      incorrectAnswers, 
      completionTimeSeconds, 
      streak 
    } = req.body;

    if (!gameType || score === undefined) {
      return res.status(400).json({ success: false, message: 'Game type and score are required' });
    }

    const patientId = req.user.role === 'patient' 
      ? (req.user._id || req.user.id) 
      : (req.body.patientId || req.user.patientId || 'patient_demo_1');

    const totalTrials = (correctAnswers || 0) + (incorrectAnswers || 0);
    const accuracy = totalTrials > 0 ? Math.round(((correctAnswers || 0) / totalTrials) * 100) : 100;

    const adapt = generateAdaptiveRecommendation(
      score, 
      accuracy, 
      completionTimeSeconds || 30, 
      difficulty || 'easy'
    );

    const newScore = await createGameScore({
      patientId,
      gameType,
      gameTitle: gameTitle || `${gameType.toUpperCase()} Cognitive Challenge`,
      difficulty: difficulty || 'easy',
      score: Number(score),
      correctAnswers: Number(correctAnswers) || 0,
      incorrectAnswers: Number(incorrectAnswers) || 0,
      accuracy,
      completionTimeSeconds: Number(completionTimeSeconds) || 0,
      streak: Number(streak) || 0,
      aiRecommendation: adapt.recommendation,
      playedAt: new Date()
    });

    // Update daily activity games played count
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAct = await getDailyActivity(patientId, todayStr);
    await updateDailyActivity(patientId, todayStr, {
      gamesPlayed: (todayAct.gamesPlayed || 0) + 1
    });

    res.status(201).json({
      success: true,
      message: 'Great job! Cognitive session saved.',
      score: newScore,
      aiAdaptation: adapt
    });
  } catch (err) {
    console.error('Record score error:', err);
    res.status(500).json({ success: false, message: 'Server error saving cognitive session' });
  }
});

module.exports = router;
