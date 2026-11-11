const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  gameType: { 
    type: String, 
    enum: ['memory', 'pattern', 'number', 'word'], 
    required: true 
  },
  gameTitle: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  score: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 100 }, // percentage
  completionTimeSeconds: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  aiRecommendation: { type: String, default: '' },
  playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.GameScore || mongoose.model('GameScore', gameScoreSchema);
