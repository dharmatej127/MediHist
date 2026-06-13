const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    lowercase: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
  },
  doctorId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  specialization: {
    type: String,
    trim: true,
  },
  hospitalName: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
