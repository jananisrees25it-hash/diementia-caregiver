const express = require('express');
const router = express.Router();
const { 
  getCaregiverNotes, 
  createCaregiverNote, 
  updateCaregiverNote, 
  deleteCaregiverNote 
} = require('../services/dataService');
const { protect } = require('../middleware/auth');

// @route   GET /api/notes
// @desc    Get all caregiver notes for a patient
router.get('/', protect, async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' 
      ? (req.user._id || req.user.id) 
      : (req.query.patientId || req.user.patientId || 'patient_demo_1');

    let notes = await getCaregiverNotes(patientId);

    const { category, priority, search } = req.query;

    if (category && category !== 'all') {
      notes = notes.filter(n => n.category === category);
    }

    if (priority && priority !== 'all') {
      notes = notes.filter(n => n.priority === priority);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      notes = notes.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.content && n.content.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: notes.length, notes });
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving notes' });
  }
});

// @route   POST /api/notes
// @desc    Create a new caregiver note
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, priority, patientId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const targetPatientId = req.user.role === 'patient' 
      ? (req.user._id || req.user.id) 
      : (patientId || req.user.patientId || 'patient_demo_1');

    const newNote = await createCaregiverNote({
      caregiverId: req.user._id || req.user.id,
      patientId: targetPatientId,
      title,
      content,
      category: category || 'General',
      priority: priority || 'normal'
    });

    res.status(201).json({
      success: true,
      message: 'Caregiver note recorded successfully!',
      note: newNote
    });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ success: false, message: 'Server error creating note' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a caregiver note
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateCaregiverNote(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, message: 'Note updated successfully!', note: updated });
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ success: false, message: 'Server error updating note' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a caregiver note
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCaregiverNote(id);
    res.json({ success: true, message: 'Caregiver note deleted successfully' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting note' });
  }
});

module.exports = router;
