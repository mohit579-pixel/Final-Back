import mongoose from 'mongoose';

const TreatmentStepSchema = new mongoose.Schema({
  description: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }
});

const TreatmentPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  estimatedTotalDuration: { type: Number }, // days
  totalCost: { type: Number },
  steps: [TreatmentStepSchema],
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: { type: String },
  prescription: {
    fileUrl: { type: String },
    uploadedAt: { type: Date }
  }
}, {
  timestamps: true
});

if (mongoose.models.TreatmentPlan) {
  delete mongoose.models.TreatmentPlan;
}

export const TreatmentPlan = mongoose.model('TreatmentPlan', TreatmentPlanSchema);