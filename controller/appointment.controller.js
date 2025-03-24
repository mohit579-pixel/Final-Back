import Appointment from "../models/appointment.models.js";
import User from "../models/user.models.js"; // Assuming you have a User model
import { Types } from "mongoose";

// Get all appointments (with filtering options)
export const getAllAppointments = async (req, res) => {
  try {
    const { 
      patientId, 
      doctorId, 
      status, 
      startDate, 
      endDate, 
      type 
    } = req.query;
    
    const query = {};
    
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    if (type) query.type = type;
    
    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email speciality')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
      error: error.message
    });
  }
};

// Get single appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email speciality');
      
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointment",
      error: error.message
    });
  }
};

// Get appointments for a specific patient
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const appointments = await Appointment.find({ patientId })
      // .populate('doctorId', 'name speciality')
      .sort({ date: 1, startTime: 1 });
      console.log(appointments);  
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve patient appointments",
      error: error.message
    });
  }
};

// Get appointments for a specific doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve doctor appointments",
      error: error.message
    });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { 
      patientId, 
      doctorId, 
      date, 
      startTime, 
      endTime, 
      type, 
      notes, 
      location 
    } = req.body;
    
    // Check for time conflicts (overlapping appointments for doctor)
    const conflictAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      $or: [
        { 
          startTime: { $lt: endTime },
          endTime: { $gt: startTime } 
        },
        {
          startTime: startTime,
          endTime: endTime
        }
      ],
      status: { $ne: "canceled" }
    });
    
    if (conflictAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked"
      });
    }
    
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      type,
      notes,
      location,
      status: "upcoming"
    });
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message
    });
  }
};

// Update an appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const updateData = req.body;
    
    // Check if changing date/time and if there are conflicts
    if ((updateData.date || updateData.startTime || updateData.endTime) && updateData.doctorId) {
      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found"
        });
      }
      
      const dateToCheck = updateData.date ? new Date(updateData.date) : appointment.date;
      const startTimeToCheck = updateData.startTime || appointment.startTime;
      const endTimeToCheck = updateData.endTime || appointment.endTime;
      const doctorIdToCheck = updateData.doctorId || appointment.doctorId;
      
      const conflictAppointment = await Appointment.findOne({
        _id: { $ne: appointmentId }, // Exclude current appointment
        doctorId: doctorIdToCheck,
        date: dateToCheck,
        $or: [
          { 
            startTime: { $lt: endTimeToCheck },
            endTime: { $gt: startTimeToCheck } 
          },
          {
            startTime: startTimeToCheck,
            endTime: endTimeToCheck
          }
        ],
        status: { $ne: "canceled" }
      });
      
      if (conflictAppointment) {
        return res.status(400).json({
          success: false,
          message: "This time slot is already booked"
        });
      }
    }
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name email')
     .populate('doctorId', 'name email speciality');
    
    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message
    });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    // Check if user is authorized (if needed)
    if (req.user && req.user._id && 
        appointment.patientId && 
        req.user._id.toString() !== appointment.patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own appointments"
      });
    }
    
    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: "canceled" },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: "Appointment canceled successfully",
      data: updatedAppointment
    });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message
    });
  
  }
};

// Get available time slots for a doctor on a specific date
export const getDoctorAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId and date are required"
      });
    }
    
    // Get doctor's working hours (assuming they are stored in user model or a separate schedule model)
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    
    // Default working hours (9 AM to 5 PM)
    // You would replace this with actual working hours from your doctor model
    const workingHours = {
      start: "09:00",
      end: "17:00",
      slotDuration: 30 // minutes
    };
    
    // Get booked appointments for that day
    const bookedAppointments = await Appointment.find({
      doctorId: doctor._id,
      date: new Date(date),
      status: { $ne: "canceled" }
    }).select('startTime endTime');
    
    // Generate all possible time slots based on working hours
    const allSlots = [];
    let currentTime = workingHours.start;
    
    while (currentTime < workingHours.end) {
      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + workingHours.slotDuration;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      
      const endTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      
      if (endTime <= workingHours.end) {
        allSlots.push({
          startTime: currentTime,
          endTime
        });
      }
      
      currentTime = endTime;
    }
    
    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      return !bookedAppointments.some(appointment => {
        // Check if slot overlaps with any appointment
        return (
          (slot.startTime < appointment.endTime && slot.endTime > appointment.startTime) ||
          (slot.startTime === appointment.startTime && slot.endTime === appointment.endTime)
        );
      });
    });
    
    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve available slots",
      error: error.message
    });
  }
};

// Delete an appointment (admin only)
export const deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    const appointment = await Appointment.findByIdAndDelete(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      error: error.message
    });
  }
};