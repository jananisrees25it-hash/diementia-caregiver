const mongoose = require('mongoose');

const caregiverNoteSchema = new mongoose.Schema({
  caregiverId: { type: String, required: true },
  patientId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['General', 'Doctor Advice', 'Observation', 'Medication', 'Emergency'], 
    default: 'General' 
  },
  priority: { 
    type: String, 
    enum: ['normal', 'important', 'urgent'], 
    default: 'normal' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.CaregiverNote || mongoose.model('CaregiverNote', caregiverNoteSchema);
