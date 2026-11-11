const express = require('express');
const router = express.Router();
const { 
  getReminders, 
  getReminderById, 
  createReminder, 
  updateReminder, 
  deleteReminder,
  updateDailyActivity,
  getDailyActivity
} = require('../services/dataService');
const { protect } = require('../middleware/auth');

// Helper to determine target patient ID
const resolvePatientId = (req) => {
  if (req.user.role === 'patient') {
    return req.user._id || req.user.id;
  }
  // For caregiver, check query param or patientId on caregiver record
  return req.query.patientId || req.user.patientId || 'patient_demo_1';
};

// @route   GET /api/reminders
// @desc    Get all reminders for patient (with search and category filter)
router.get('/', protect, async (req, res) => {
  try {
    const patientId = resolvePatientId(req);
    let reminders = await getReminders(patientId);

    const { category, search, completed, priority, date } = req.query;

    if (category && category !== 'all') {
      reminders = reminders.filter(r => r.category === category);
    }

    if (completed !== undefined) {
      const isComp = completed === 'true';
      reminders = reminders.filter(r => r.isCompleted === isComp);
    }

    if (priority && priority !== 'all') {
      reminders = reminders.filter(r => r.priority === priority);
    }

    if (date) {
      reminders = reminders.filter(r => r.date === date || r.date === 'Daily');
    }

    if (search && search.trim() !== '') {
      const query = search.toLowerCase();
      reminders = reminders.filter(r => 
        (r.title && r.title.toLowerCase().includes(query)) ||
        (r.description && r.description.toLowerCase().includes(query)) ||
        (r.location && r.location.toLowerCase().includes(query))
      );
    }

    res.json({ success: true, count: reminders.length, reminders });
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving reminders' });
  }
});

// @route   POST /api/reminders
// @desc    Create a new reminder
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, time, date, priority, recurrence, dosage, location, patientId } = req.body;

    if (!title || !time) {
      return res.status(400).json({ success: false, message: 'Reminder title and time are required' });
    }

    const targetPatientId = req.user.role === 'patient' 
      ? (req.user._id || req.user.id) 
      : (patientId || req.user.patientId || 'patient_demo_1');

    const newReminder = await createReminder({
      patientId: targetPatientId,
      title,
      description: description || '',
      category: category || 'routine',
      time,
      date: date || 'Daily',
      priority: priority || 'medium',
      recurrence: recurrence || 'daily',
      dosage: dosage || '',
      location: location || '',
      isCompleted: false,
      completedAt: null,
      isMissed: false,
      createdBy: req.user._id || req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Reminder scheduled successfully!',
      reminder: newReminder
    });
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ success: false, message: 'Server error creating reminder' });
  }
});

// @route   PUT /api/reminders/:id
// @desc    Update an existing reminder
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getReminderById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    const updated = await updateReminder(id, req.body);
    res.json({ success: true, message: 'Reminder updated successfully!', reminder: updated });
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ success: false, message: 'Server error updating reminder' });
  }
});

// @route   PATCH /api/reminders/:id/toggle
// @desc    Toggle reminder completion status (for patient / caregiver checklist)
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getReminderById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    const newStatus = !existing.isCompleted;
    const completedAt = newStatus ? new Date() : null;

    const updated = await updateReminder(id, { 
      isCompleted: newStatus, 
      completedAt,
      isMissed: newStatus ? false : existing.isMissed 
    });

    // Update daily activity counts
    const patientId = existing.patientId;
    const todayStr = new Date().toISOString().split('T')[0];
    const allReminders = await getReminders(patientId);
    
    const completedCount = allReminders.filter(r => r.isCompleted).length;
    const medCompletedCount = allReminders.filter(r => r.category === 'medication' && r.isCompleted).length;
    const medTotalCount = allReminders.filter(r => r.category === 'medication').length;

    await updateDailyActivity(patientId, todayStr, {
      tasksCompleted: completedCount,
      tasksTotal: allReminders.length,
      medicationsTaken: medCompletedCount,
      medicationsTotal: medTotalCount
    });

    res.json({
      success: true,
      message: newStatus ? 'Routine marked as completed! Great job!' : 'Routine reset to pending',
      reminder: updated
    });
  } catch (err) {
    console.error('Toggle reminder error:', err);
    res.status(500).json({ success: false, message: 'Server error toggling reminder status' });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete a reminder
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getReminderById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    await deleteReminder(id);
    res.json({ success: true, message: 'Reminder removed successfully' });
  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting reminder' });
  }
});

// @route   POST /api/reminders/sync
// @desc    Synchronize offline actions (completed/updated reminders) when internet connection returns
router.post('/sync', protect, async (req, res) => {
  try {
    const { offlineUpdates } = req.body;
    if (!Array.isArray(offlineUpdates) || offlineUpdates.length === 0) {
      return res.json({ success: true, synced: 0, message: 'No offline changes to sync' });
    }

    let syncedCount = 0;
    for (const update of offlineUpdates) {
      if (update.id) {
        await updateReminder(update.id, {
          isCompleted: update.isCompleted,
          completedAt: update.completedAt || new Date()
        });
        syncedCount++;
      }
    }

    res.json({
      success: true,
      synced: syncedCount,
      message: `Successfully synchronized ${syncedCount} item(s) from offline storage!`
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ success: false, message: 'Error synchronizing offline data' });
  }
});

module.exports = router;
