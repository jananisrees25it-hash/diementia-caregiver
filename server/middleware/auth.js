const jwt = require('jsonwebtoken');
const { getUserById } = require('../services/dataService');

const JWT_SECRET = process.env.JWT_SECRET || 'cognitive_care_super_secret_jwt_key_2025';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found with this token' });
    }

    // Attach user without password
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    req.user = userObj;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized: Invalid or expired token' });
  }
};

const caregiverOnly = (req, res, next) => {
  if (req.user && req.user.role === 'caregiver') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Caregiver role required' });
};

const patientOnly = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: Patient role required' });
};

module.exports = { protect, caregiverOnly, patientOnly, JWT_SECRET };
