const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['DOCTOR', 'NURSE', 'RECEPTIONIST'],
    required: true
  },
  specialization: {
    type: String,
    required: function() {
      return this.role === 'DOCTOR';
    }
  },
  department: {
    type: String,
    enum: ['DENTAL', 'ORTHODONTICS', 'SURGERY', 'GENERAL'],
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  workingHours: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date
  }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema); 