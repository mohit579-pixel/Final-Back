const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
});

const scheduleSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlots: [timeSlotSchema],
  isAvailable: {
    type: Boolean,
    default: true
  },
  notes: String
}, {
  timestamps: true
});

// Index for efficient querying
scheduleSchema.index({ staffId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema); 