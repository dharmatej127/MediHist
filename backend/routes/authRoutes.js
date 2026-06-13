const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PatientRecord = require('../models/PatientRecord');
const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, role, doctorId, specialization, hospitalName, phone } = req.body;

  try {
    if (role === 'doctor') {
      if (!doctorId || !specialization || !hospitalName || !firstName || !lastName || !password) {
        return res.status(400).json({ message: 'All fields (Doctor ID, Specialization, Hospital, Name, Password) are required' });
      }

      const doctorExists = await User.findOne({ doctorId });
      if (doctorExists) {
        return res.status(400).json({ message: 'Doctor ID already exists' });
      }

      const mockEmail = `${doctorId.toLowerCase().replace(/\s+/g, '')}@medihist.com`;
      const user = await User.create({
        email: mockEmail,
        password,
        role: 'doctor',
        profile: { firstName, lastName, phone },
        doctorId,
        specialization,
        hospitalName
      });

      return res.status(201).json({
        _id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        doctorId: user.doctorId,
        specialization: user.specialization,
        hospitalName: user.hospitalName,
        token: generateToken(user._id, user.role),
      });
    } else {
      // Patient registration
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ message: 'All fields (Email, Name, Password) are required' });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      const user = await User.create({
        email,
        password,
        role: role || 'patient',
        profile: { firstName, lastName, phone }
      });

      if (user) {
        await PatientRecord.create({ user: user._id });

        return res.status(201).json({
          _id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          token: generateToken(user._id, user.role),
        });
      } else {
        return res.status(400).json({ message: 'Invalid user data' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth patient & get token
// @route   POST /api/auth/login/patient
// @access  Public
router.post('/login/patient', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: 'patient' });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth doctor & get token
// @route   POST /api/auth/login/doctor
// @access  Public
router.post('/login/doctor', async (req, res) => {
  const { doctorId, specialization, hospitalName, password } = req.body;

  try {
    const user = await User.findOne({ doctorId, role: 'doctor' });

    if (user && (await user.comparePassword(password))) {
      // Validate specialization and hospitalName match
      if (
        user.specialization?.toLowerCase().trim() !== specialization?.toLowerCase().trim() ||
        user.hospitalName?.toLowerCase().trim() !== hospitalName?.toLowerCase().trim()
      ) {
        return res.status(401).json({ message: 'Specialization or Hospital Name mismatch' });
      }

      res.json({
        _id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        doctorId: user.doctorId,
        specialization: user.specialization,
        hospitalName: user.hospitalName,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid Doctor ID or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Keep generic /login endpoint for compatibility/fallback
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        doctorId: user.doctorId,
        specialization: user.specialization,
        hospitalName: user.hospitalName,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
