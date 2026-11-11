const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['medication', 'water', 'appointment', 'routine', 'task'], 
    default: 'routine' 
  },
  time: { type: String, required: true }, // e.g. "08:30 AM" or "08:30"
  date: { type: String, default: 'Daily' }, // YYYY-MM-DD or 'Daily'
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  recurrence: { type: String, enum: ['daily', 'weekly', 'once'], default: 'daily' },
  dosage: { type: String, default: '' },
  location: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  isMissed: { type: Boolean, default: false },
  createdBy: { type: String, default: 'system' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);
