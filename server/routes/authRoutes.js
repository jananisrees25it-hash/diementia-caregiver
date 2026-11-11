const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  getUserByEmail, 
  getUserById, 
  createUser, 
  updateUser,
  resetToDemoData 
} = require('../services/dataService');
const { protect, JWT_SECRET } = require('../middleware/auth');

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Patient or Caregiver)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, age, emergencyContact, medicalNotes } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === 'caregiver' ? 'caregiver' : 'patient';

    const newUser = await createUser({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      age: age ? Number(age) : (userRole === 'patient' ? 70 : 40),
      avatar: userRole === 'patient' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      emergencyContact: emergencyContact || {
        name: 'Emergency Contact',
        relation: 'Family',
        phone: '+1 (555) 000-0000',
        alternatePhone: ''
      },
      medicalNotes: medicalNotes || (userRole === 'patient' ? 'Routine cognitive memory exercises and medication adherence.' : ''),
      caregiverId: null,
      patientId: userRole === 'caregiver' ? 'patient_demo_1' : null,
      hydrationGoal: 8,
      hydrationCurrent: 0
    });

    const token = signToken(newUser._id || newUser.id);
    const userObj = newUser.toObject ? newUser.toObject() : { ...newUser };
    delete userObj.password;

    res.status(201).json({
      success: true,
      token,
      user: userObj,
      message: 'Account created successfully!'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user._id || user.id);
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj,
      message: 'Logged in successfully'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   POST /api/auth/demo-login
// @desc    Instant 1-click Demo Login for quick testing & presentation
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body;
    const targetEmail = role === 'caregiver' ? 'caregiver@demo.com' : 'patient@demo.com';

    let user = await getUserByEmail(targetEmail);
    if (!user) {
      // Re-seed demo data if somehow deleted
      resetToDemoData();
      user = await getUserByEmail(targetEmail);
    }

    const token = signToken(user._id || user.id);
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj,
      message: `Signed in as Demo ${userObj.role === 'patient' ? 'Patient (Robert Vance)' : 'Caregiver (Sarah Vance)'}`
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ success: false, message: 'Server error during demo login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await getUserById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    res.json({ success: true, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role; // Role cannot be switched arbitrarily
    delete updates.email;

    const updatedUser = await updateUser(req.user._id || req.user.id, updates);
    const userObj = updatedUser.toObject ? updatedUser.toObject() : { ...updatedUser };
    delete userObj.password;

    res.json({ success: true, user: userObj, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// @route   POST /api/auth/reset-demo
// @desc    Reset data to default demo state
router.post('/reset-demo', async (req, res) => {
  try {
    resetToDemoData();
    res.json({ success: true, message: 'Demo data has been reset to defaults!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset demo data' });
  }
});

module.exports = router;
