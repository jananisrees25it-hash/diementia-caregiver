const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'caregiver'], default: 'patient' },
  age: { type: Number, default: 72 },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80' },
  emergencyContact: {
    name: { type: String, default: 'Sarah Vance' },
    relation: { type: String, default: 'Daughter / Primary Caregiver' },
    phone: { type: String, default: '+1 (555) 234-5678' },
    alternatePhone: { type: String, default: '+1 (555) 876-5432' }
  },
  caregiverId: { type: String, default: null },
  patientId: { type: String, default: null },
  medicalNotes: { type: String, default: 'Mild cognitive forgetfulness; benefits from gentle recurring reminders, routine structure, and memory games.' },
  hydrationGoal: { type: Number, default: 8 },
  hydrationCurrent: { type: Number, default: 4 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
