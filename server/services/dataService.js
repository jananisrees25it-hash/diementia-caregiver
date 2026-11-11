const fs = require('fs');
const path = require('path');
const { isMongoConnected } = require('../config/db');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const GameScore = require('../models/GameScore');
const CaregiverNote = require('../models/CaregiverNote');
const DailyActivity = require('../models/DailyActivity');
const { getInitialData } = require('../data/seedData');

const DATA_FILE = path.join(__dirname, '..', 'data', 'store.json');

// In-memory cache when running in filestore mode
let memoryStore = null;

const loadFileStore = () => {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(raw);
      return memoryStore;
    }
  } catch (e) {
    console.error('[DataService] Error reading store.json, resetting to seed:', e.message);
  }

  // Initialize with seed
  memoryStore = getInitialData();
  saveFileStore();
  return memoryStore;
};

const saveFileStore = () => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DataService] Error saving store.json:', e.message);
  }
};

const initDataService = async () => {
  if (isMongoConnected()) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[DataService] MongoDB is empty. Seeding initial demonstration data...');
        const initial = getInitialData();
        await User.insertMany(initial.users);
        await Reminder.insertMany(initial.reminders);
        await GameScore.insertMany(initial.gameScores);
        await CaregiverNote.insertMany(initial.caregiverNotes);
        await DailyActivity.insertMany(initial.dailyActivities);
        console.log('[DataService] MongoDB seeded successfully!');
      } else {
        console.log(`[DataService] MongoDB active with ${userCount} users.`);
      }
    } catch (e) {
      console.error('[DataService] Error checking/seeding MongoDB:', e.message);
    }
  } else {
    loadFileStore();
    console.log('[DataService] File store initialized with demo data.');
  }
};

// ================= USER METHODS =================
const getUserByEmail = async (email) => {
  if (isMongoConnected()) {
    return await User.findOne({ email: email.toLowerCase() });
  }
  const store = loadFileStore();
  return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

const getUserById = async (id) => {
  if (isMongoConnected()) {
    return await User.findById(id);
  }
  const store = loadFileStore();
  return store.users.find(u => (u._id === id || u.id === id)) || null;
};

const getAllPatients = async () => {
  if (isMongoConnected()) {
    return await User.find({ role: 'patient' });
  }
  const store = loadFileStore();
  return store.users.filter(u => u.role === 'patient');
};

const createUser = async (userData) => {
  if (isMongoConnected()) {
    const user = new User(userData);
    return await user.save();
  }
  const store = loadFileStore();
  const id = 'usr_' + Date.now();
  const newUser = {
    _id: id,
    id: id,
    ...userData,
    createdAt: new Date()
  };
  store.users.push(newUser);
  saveFileStore();
  return newUser;
};

const updateUser = async (id, updates) => {
  if (isMongoConnected()) {
    return await User.findByIdAndUpdate(id, updates, { new: true });
  }
  const store = loadFileStore();
  const idx = store.users.findIndex(u => (u._id === id || u.id === id));
  if (idx !== -1) {
    store.users[idx] = { ...store.users[idx], ...updates };
    saveFileStore();
    return store.users[idx];
  }
  return null;
};

// ================= REMINDER METHODS =================
const getReminders = async (patientId) => {
  if (isMongoConnected()) {
    return await Reminder.find({ patientId }).sort({ time: 1 });
  }
  const store = loadFileStore();
  return store.reminders.filter(r => r.patientId === patientId);
};

const getReminderById = async (id) => {
  if (isMongoConnected()) {
    return await Reminder.findById(id);
  }
  const store = loadFileStore();
  return store.reminders.find(r => (r._id === id || r.id === id)) || null;
};

const createReminder = async (data) => {
  if (isMongoConnected()) {
    const rem = new Reminder(data);
    return await rem.save();
  }
  const store = loadFileStore();
  const id = 'rem_' + Date.now();
  const newRem = {
    _id: id,
    id: id,
    isCompleted: false,
    completedAt: null,
    isMissed: false,
    createdAt: new Date(),
    ...data
  };
  store.reminders.push(newRem);
  saveFileStore();
  return newRem;
};

const updateReminder = async (id, updates) => {
  if (isMongoConnected()) {
    return await Reminder.findByIdAndUpdate(id, updates, { new: true });
  }
  const store = loadFileStore();
  const idx = store.reminders.findIndex(r => (r._id === id || r.id === id));
  if (idx !== -1) {
    store.reminders[idx] = { ...store.reminders[idx], ...updates };
    saveFileStore();
    return store.reminders[idx];
  }
  return null;
};

const deleteReminder = async (id) => {
  if (isMongoConnected()) {
    return await Reminder.findByIdAndDelete(id);
  }
  const store = loadFileStore();
  const initialLen = store.reminders.length;
  store.reminders = store.reminders.filter(r => (r._id !== id && r.id !== id));
  saveFileStore();
  return store.reminders.length < initialLen;
};

// ================= GAME SCORE METHODS =================
const getGameScores = async (patientId) => {
  if (isMongoConnected()) {
    return await GameScore.find({ patientId }).sort({ playedAt: -1 });
  }
  const store = loadFileStore();
  return store.gameScores
    .filter(g => g.patientId === patientId)
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
};

const createGameScore = async (data) => {
  if (isMongoConnected()) {
    const score = new GameScore(data);
    return await score.save();
  }
  const store = loadFileStore();
  const id = 'score_' + Date.now();
  const newScore = {
    _id: id,
    id: id,
    playedAt: new Date(),
    ...data
  };
  store.gameScores.unshift(newScore);
  saveFileStore();
  return newScore;
};

// ================= CAREGIVER NOTE METHODS =================
const getCaregiverNotes = async (patientId) => {
  if (isMongoConnected()) {
    return await CaregiverNote.find({ patientId }).sort({ createdAt: -1 });
  }
  const store = loadFileStore();
  return store.caregiverNotes
    .filter(n => n.patientId === patientId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const createCaregiverNote = async (data) => {
  if (isMongoConnected()) {
    const note = new CaregiverNote(data);
    return await note.save();
  }
  const store = loadFileStore();
  const id = 'note_' + Date.now();
  const newNote = {
    _id: id,
    id: id,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data
  };
  store.caregiverNotes.unshift(newNote);
  saveFileStore();
  return newNote;
};

const updateCaregiverNote = async (id, updates) => {
  if (isMongoConnected()) {
    return await CaregiverNote.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
  }
  const store = loadFileStore();
  const idx = store.caregiverNotes.findIndex(n => (n._id === id || n.id === id));
  if (idx !== -1) {
    store.caregiverNotes[idx] = { 
      ...store.caregiverNotes[idx], 
      ...updates, 
      updatedAt: new Date() 
    };
    saveFileStore();
    return store.caregiverNotes[idx];
  }
  return null;
};

const deleteCaregiverNote = async (id) => {
  if (isMongoConnected()) {
    return await CaregiverNote.findByIdAndDelete(id);
  }
  const store = loadFileStore();
  const initialLen = store.caregiverNotes.length;
  store.caregiverNotes = store.caregiverNotes.filter(n => (n._id !== id && n.id !== id));
  saveFileStore();
  return store.caregiverNotes.length < initialLen;
};

// ================= DAILY ACTIVITY & HYDRATION =================
const getDailyActivity = async (patientId, date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  if (isMongoConnected()) {
    let act = await DailyActivity.findOne({ patientId, date: targetDate });
    if (!act) {
      act = new DailyActivity({ patientId, date: targetDate });
      await act.save();
    }
    return act;
  }
  const store = loadFileStore();
  let act = store.dailyActivities.find(a => a.patientId === patientId && a.date === targetDate);
  if (!act) {
    act = {
      _id: 'act_' + Date.now(),
      id: 'act_' + Date.now(),
      patientId,
      date: targetDate,
      waterGlasses: 0,
      waterGoal: 8,
      tasksCompleted: 0,
      tasksTotal: 0,
      medicationsTaken: 0,
      medicationsTotal: 0,
      gamesPlayed: 0,
      lastActive: new Date()
    };
    store.dailyActivities.push(act);
    saveFileStore();
  }
  return act;
};

const updateDailyActivity = async (patientId, date, updates) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  if (isMongoConnected()) {
    return await DailyActivity.findOneAndUpdate(
      { patientId, date: targetDate },
      { ...updates, lastActive: new Date() },
      { new: true, upsert: true }
    );
  }
  const store = loadFileStore();
  let idx = store.dailyActivities.findIndex(a => a.patientId === patientId && a.date === targetDate);
  if (idx === -1) {
    const newAct = {
      _id: 'act_' + Date.now(),
      id: 'act_' + Date.now(),
      patientId,
      date: targetDate,
      waterGlasses: 0,
      waterGoal: 8,
      tasksCompleted: 0,
      tasksTotal: 0,
      medicationsTaken: 0,
      medicationsTotal: 0,
      gamesPlayed: 0,
      lastActive: new Date(),
      ...updates
    };
    store.dailyActivities.push(newAct);
    saveFileStore();
    return newAct;
  } else {
    store.dailyActivities[idx] = {
      ...store.dailyActivities[idx],
      ...updates,
      lastActive: new Date()
    };
    saveFileStore();
    return store.dailyActivities[idx];
  }
};

// Reset demo data helper
const resetToDemoData = () => {
  memoryStore = getInitialData();
  saveFileStore();
  return memoryStore;
};

module.exports = {
  initDataService,
  getUserByEmail,
  getUserById,
  getAllPatients,
  createUser,
  updateUser,
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
  getGameScores,
  createGameScore,
  getCaregiverNotes,
  createCaregiverNote,
  updateCaregiverNote,
  deleteCaregiverNote,
  getDailyActivity,
  updateDailyActivity,
  resetToDemoData
};
