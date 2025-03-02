import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    scheduledDate: { type: Date, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Completed"], default: "Pending" },
    reason: { type: String, required: true },
    paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
  },
  { timestamps: true }
);

const Appointment = model("Appointment", appointmentSchema);
export default Appointment;
