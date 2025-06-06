const mongoose = require('mongoose');

const financialSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['REVENUE', 'EXPENSE'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'INSURANCE', 'BANK_TRANSFER'],
    required: true
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedToModel'
  },
  relatedToModel: {
    type: String,
    enum: ['Appointment', 'Staff', 'Inventory']
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
    default: 'COMPLETED'
  },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
financialSchema.index({ type: 1, date: 1 });
financialSchema.index({ category: 1 });
financialSchema.index({ status: 1 });

module.exports = mongoose.model('Financial', financialSchema); 