const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  requiredEquipment: [{
    type: String
  }],
  requiredMaterials: [{
    type: String
  }],
  notes: String
});

const protocolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['PREVENTIVE', 'RESTORATIVE', 'SURGICAL', 'COSMETIC', 'ORTHODONTIC'],
    required: true
  },
  steps: [stepSchema],
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  requiredQualifications: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Protocol', protocolSchema); 