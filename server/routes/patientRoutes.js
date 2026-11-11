const express = require('express');
const router = express.Router();
const { 
  getUserById, 
  getAllPatients, 
  updateUser, 
  getReminders, 
  getDailyActivity, 
  updateDailyActivity,
  getGameScores,
  getCaregiverNotes
} = require('../services/dataService');
const { protect } = require('../middleware/auth');

// @route   GET /api/patients
// @desc    Get all patients (for caregiver patient switcher)
router.get('/', protect, async (req, res) => {
  try {
    const patients = await getAllPatients();
    const sanitized = patients.map(p => {
      const pObj = p.toObject ? p.toObject() : { ...p };
      delete pObj.password;
      return pObj;
    });
    res.json({ success: true, count: sanitized.length, patients: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving patients' });
  }
});

// @route   GET /api/patients/:id/summary
// @desc    Get comprehensive overview summary of patient for Caregiver Dashboard / Patient Dashboard
router.get('/:id/summary', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await getUserById(id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const patientObj = patient.toObject ? patient.toObject() : { ...patient };
    delete patientObj.password;

    const todayStr = new Date().toISOString().split('T')[0];
    const reminders = await getReminders(id);
    const activity = await getDailyActivity(id, todayStr);
    const recentScores = await getGameScores(id);
    const recentNotes = await getCaregiverNotes(id);

    const completedReminders = reminders.filter(r => r.isCompleted);
    const pendingReminders = reminders.filter(r => !r.isCompleted);
    const missedReminders = reminders.filter(r => r.isMissed);

    const medicationReminders = reminders.filter(r => r.category === 'medication');
    const medicationCompleted = medicationReminders.filter(r => r.isCompleted).length;

    const completionRate = reminders.length > 0 
      ? Math.round((completedReminders.length / reminders.length) * 100) 
      : 0;

    res.json({
      success: true,
      patient: patientObj,
      summary: {
        date: todayStr,
        totalReminders: reminders.length,
        completedCount: completedReminders.length,
        pendingCount: pendingReminders.length,
        missedCount: missedReminders.length,
        completionRate,
        medicationCompleted,
        medicationTotal: medicationReminders.length,
        waterGlasses: activity.waterGlasses || patientObj.hydrationCurrent || 0,
        waterGoal: activity.waterGoal || patientObj.hydrationGoal || 8,
        gamesPlayedToday: activity.gamesPlayed || 0,
        recentGameScore: recentScores[0] || null,
        totalGameSessions: recentScores.length,
        recentNote: recentNotes[0] || null
      },
      reminders,
      recentScores: recentScores.slice(0, 5),
      recentNotes: recentNotes.slice(0, 5)
    });
  } catch (err) {
    console.error('Patient summary error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving patient summary' });
  }
});

// @route   POST /api/patients/:id/water
// @desc    Log a glass of water for hydration tracker
router.post('/:id/water', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'add' or 'reset'
    const todayStr = new Date().toISOString().split('T')[0];

    const currentActivity = await getDailyActivity(id, todayStr);
    let newGlasses = currentActivity.waterGlasses || 0;

    if (action === 'reset') {
      newGlasses = 0;
    } else {
      newGlasses += 1;
    }

    const updatedActivity = await updateDailyActivity(id, todayStr, {
      waterGlasses: newGlasses
    });

    await updateUser(id, { hydrationCurrent: newGlasses });

    res.json({
      success: true,
      message: action === 'reset' ? 'Hydration counter reset' : 'Good job staying hydrated! 1 glass recorded.',
      waterGlasses: newGlasses,
      waterGoal: updatedActivity.waterGoal || 8
    });
  } catch (err) {
    console.error('Water tracker error:', err);
    res.status(500).json({ success: false, message: 'Server error updating hydration tracker' });
  }
});

// @route   POST /api/patients/:id/emergency-alert
// @desc    Trigger simulated emergency contact alert
router.post('/:id/emergency-alert', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await getUserById(id);

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const contact = patient.emergencyContact || {
      name: 'Sarah Vance',
      phone: '+1 (555) 234-5678'
    };

    const alertDetails = {
      patientName: patient.name,
      patientId: id,
      time: new Date().toLocaleTimeString(),
      contactName: contact.name,
      contactPhone: contact.phone,
      status: 'DISPATCHED_TO_PRIMARY_CAREGIVER',
      message: `Emergency notification triggered for ${patient.name}. Caregiver ${contact.name} (${contact.phone}) notified immediately.`
    };

    console.log(`[EMERGENCY ALERT] *** TRIGGERED FOR PATIENT: ${patient.name} *** Phone: ${contact.phone}`);

    res.json({
      success: true,
      message: 'Emergency alert dispatched to caregiver!',
      alert: alertDetails
    });
  } catch (err) {
    console.error('Emergency alert error:', err);
    res.status(500).json({ success: false, message: 'Server error processing emergency alert' });
  }
});

module.exports = router;
