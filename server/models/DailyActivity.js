const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  waterGlasses: { type: Number, default: 0 },
  waterGoal: { type: Number, default: 8 },
  tasksCompleted: { type: Number, default: 0 },
  tasksTotal: { type: Number, default: 0 },
  medicationsTaken: { type: Number, default: 0 },
  medicationsTotal: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.models.DailyActivity || mongoose.model('DailyActivity', dailyActivitySchema);
