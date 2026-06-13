const express = require('express');
const PatientRecord = require('../models/PatientRecord');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware to verify doctor or admin role
const isDoctorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'doctor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Doctors or Administrators only.' });
  }
};

// Helper to get doctor metadata for EMR entries
const getDoctorMetadata = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return {};
  if (user.role === 'admin') {
    return {
      createdById: user._id,
      createdByDoctorId: 'ADMIN',
      createdByDoctorName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Admin User',
      createdBySpecialization: 'Hospital Management',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  return {
    createdById: user._id,
    createdByDoctorId: user.doctorId || '',
    createdByDoctorName: `Dr. ${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
    createdBySpecialization: user.specialization || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Helper to check if user has permission to edit/delete a subdocument entry
const hasEditPermission = (item, req) => {
  if (req.user.role === 'admin') return true;
  if (!item.createdById) return true; // Legacy entries can be edited by any doctor
  return item.createdById.toString() === req.user.id.toString();
};

// ── GET full record ────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── UPDATE vitals (bloodType, height, weight, dob) ────────────────────────────
router.put('/me/vitals', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    const { bloodType, height, weight, dateOfBirth } = req.body;
    if (bloodType !== undefined) record.bloodType = bloodType;
    if (height !== undefined) record.height = height;
    if (weight !== undefined) record.weight = weight;
    if (dateOfBirth !== undefined) record.dateOfBirth = dateOfBirth;
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DIAGNOSES ─────────────────────────────────────────────────────────────────
router.post('/me/diagnosis', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    record.diagnoses.push(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/me/diagnosis/:id', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    record.diagnoses = record.diagnoses.filter(d => d._id.toString() !== req.params.id);
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── MEDICATIONS ───────────────────────────────────────────────────────────────
router.post('/me/medication', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    record.medications.push(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/me/medication/:id', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    record.medications = record.medications.filter(m => m._id.toString() !== req.params.id);
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── ALLERGIES ─────────────────────────────────────────────────────────────────
router.post('/me/allergy', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    record.allergies.push(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/me/allergy/:id', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    record.allergies = record.allergies.filter(a => a._id.toString() !== req.params.id);
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── LAB RESULTS ───────────────────────────────────────────────────────────────
router.post('/me/labresult', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    record.labResults.push(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/me/labresult/:id', protect, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.user.id });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    record.labResults = record.labResults.filter(l => l._id.toString() !== req.params.id);
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DOCTOR ENDPOINTS ─────────────────────────────────────────────────────────

// GET all patients (Doctors or Admins)
router.get('/', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const records = await PatientRecord.find().populate('user', 'email profile role');
    // Filter to return only patient profiles
    const patientRecords = records.filter(r => r.user && r.user.role === 'patient');
    res.json(patientRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET specific patient record (Doctors, Admins, or patient themselves)
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin' && req.user.id !== req.params.patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const record = await PatientRecord.findOne({ user: req.params.patientId }).populate('user', 'email profile role');
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE specific patient vitals (Doctors or Admins)
router.put('/patient/:patientId/vitals', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const { bloodType, height, weight, dateOfBirth } = req.body;
    if (bloodType !== undefined) record.bloodType = bloodType;
    if (height !== undefined) record.height = height;
    if (weight !== undefined) record.weight = weight;
    if (dateOfBirth !== undefined) record.dateOfBirth = dateOfBirth;
    
    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DIAGNOSES (Doctors or Admins)
router.post('/patient/:patientId/diagnosis', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const meta = await getDoctorMetadata(req.user.id);
    const diagnosisData = { ...req.body, ...meta };
    
    record.diagnoses.push(diagnosisData);
    await record.save();
    await record.populate('user', 'email profile role');
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/patient/:patientId/diagnosis/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.diagnoses.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Diagnosis not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    item.deleteOne();
    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MEDICATIONS (Doctors or Admins)
router.post('/patient/:patientId/medication', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const meta = await getDoctorMetadata(req.user.id);
    const medicationData = { ...req.body, ...meta };
    
    record.medications.push(medicationData);
    await record.save();
    await record.populate('user', 'email profile role');
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/patient/:patientId/medication/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.medications.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Medication not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    item.deleteOne();
    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ALLERGIES (Doctors or Admins)
router.post('/patient/:patientId/allergy', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const meta = await getDoctorMetadata(req.user.id);
    const allergyData = { ...req.body, ...meta };
    
    record.allergies.push(allergyData);
    await record.save();
    await record.populate('user', 'email profile role');
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/patient/:patientId/allergy/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.allergies.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Allergy not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    item.deleteOne();
    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LAB RESULTS (Doctors or Admins)
router.post('/patient/:patientId/labresult', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const meta = await getDoctorMetadata(req.user.id);
    const labResultData = { ...req.body, ...meta };
    
    record.labResults.push(labResultData);
    await record.save();
    await record.populate('user', 'email profile role');
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/patient/:patientId/labresult/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.labResults.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Lab Result not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    item.deleteOne();
    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE Diagnosis (Doctors or Admins)
router.put('/patient/:patientId/diagnosis/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.diagnoses.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Diagnosis not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    const { condition, dateDiagnosed, status, notes } = req.body;
    if (condition !== undefined) item.condition = condition;
    if (dateDiagnosed !== undefined) item.dateDiagnosed = dateDiagnosed;
    if (status !== undefined) item.status = status;
    if (notes !== undefined) item.notes = notes;
    item.updatedAt = new Date();

    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE Medication (Doctors or Admins)
router.put('/patient/:patientId/medication/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.medications.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Medication not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    const { name, dosage, frequency, prescribedBy, startDate, endDate } = req.body;
    if (name !== undefined) item.name = name;
    if (dosage !== undefined) item.dosage = dosage;
    if (frequency !== undefined) item.frequency = frequency;
    if (prescribedBy !== undefined) item.prescribedBy = prescribedBy;
    if (startDate !== undefined) item.startDate = startDate;
    if (endDate !== undefined) item.endDate = endDate;
    item.updatedAt = new Date();

    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE Allergy (Doctors or Admins)
router.put('/patient/:patientId/allergy/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.allergies.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Allergy not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    const { allergen, reaction, severity } = req.body;
    if (allergen !== undefined) item.allergen = allergen;
    if (reaction !== undefined) item.reaction = reaction;
    if (severity !== undefined) item.severity = severity;
    item.updatedAt = new Date();

    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE Lab Result (Doctors or Admins)
router.put('/patient/:patientId/labresult/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.labResults.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Lab Result not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    const { testName, date, result, referenceRange, status } = req.body;
    if (testName !== undefined) item.testName = testName;
    if (date !== undefined) item.date = date;
    if (result !== undefined) item.result = result;
    if (referenceRange !== undefined) item.referenceRange = referenceRange;
    if (status !== undefined) item.status = status;
    item.updatedAt = new Date();

    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE Medical Report (Doctors or Admins)
router.post('/patient/:patientId/medicalreport', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const meta = await getDoctorMetadata(req.user.id);
    const reportData = { ...req.body, ...meta };
    if (meta.createdByDoctorName && !reportData.uploadedBy) {
      reportData.uploadedBy = meta.createdByDoctorName;
    }
    
    record.medicalReports.push(reportData);
    await record.save();
    await record.populate('user', 'email profile role');
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE Medical Report (Doctors or Admins)
router.put('/patient/:patientId/medicalreport/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.medicalReports.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Medical Report not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    const { title, date, fileUrl, fileName, fileType, notes, uploadedBy } = req.body;
    if (title !== undefined) item.title = title;
    if (date !== undefined) item.date = date;
    if (fileUrl !== undefined) item.fileUrl = fileUrl;
    if (fileName !== undefined) item.fileName = fileName;
    if (fileType !== undefined) item.fileType = fileType;
    if (notes !== undefined) item.notes = notes;
    if (uploadedBy !== undefined) item.uploadedBy = uploadedBy;
    item.updatedAt = new Date();

    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE Medical Report (Doctors or Admins)
router.delete('/patient/:patientId/medicalreport/:id', protect, isDoctorOrAdmin, async (req, res) => {
  try {
    const record = await PatientRecord.findOne({ user: req.params.patientId });
    if (!record) return res.status(404).json({ message: 'Patient record not found' });
    
    const item = record.medicalReports.id(req.params.id);
    if (!item) return res.status(404).json({ message: 'Medical Report not found' });
    
    if (!hasEditPermission(item, req)) {
      return res.status(403).json({ message: 'Access denied. You can only modify your own records.' });
    }
    
    item.deleteOne();
    await record.save();
    await record.populate('user', 'email profile role');
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

