const mongoose = require('mongoose');

const metadataSchemaFields = {
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByDoctorId: String,
  createdByDoctorName: String,
  createdBySpecialization: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

const diagnosisSchema = new mongoose.Schema({
  condition: String,
  dateDiagnosed: Date,
  status: { type: String, enum: ['Active', 'Resolved'] },
  notes: String,
  ...metadataSchemaFields
});

const medicationSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String,
  startDate: Date,
  endDate: Date,
  prescribedBy: String,
  ...metadataSchemaFields
});

const labResultSchema = new mongoose.Schema({
  testName: String,
  date: Date,
  result: String,
  referenceRange: String,
  status: { type: String, enum: ['Normal', 'Abnormal', 'Critical'] },
  ...metadataSchemaFields
});

const allergySchema = new mongoose.Schema({
  allergen: String,
  reaction: String,
  severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] },
  ...metadataSchemaFields
});

const medicalReportSchema = new mongoose.Schema({
  title: String,
  date: Date,
  fileUrl: String, // Base64 representation of the file (image or PDF)
  fileName: String,
  fileType: String, // e.g. 'image/jpeg', 'application/pdf'
  notes: String,
  uploadedBy: String, // Doctor's name
  ...metadataSchemaFields
});

const patientRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dateOfBirth: Date,
  bloodType: String,
  height: Number, // in cm
  weight: Number, // in kg
  diagnoses: [diagnosisSchema],
  medications: [medicationSchema],
  labResults: [labResultSchema],
  allergies: [allergySchema],
  medicalReports: [medicalReportSchema],
}, { timestamps: true });

module.exports = mongoose.model('PatientRecord', patientRecordSchema);
