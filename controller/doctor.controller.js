import Doctor from '../models/doctor.model.js';
import Appointment from '../models/appointment.models.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/error.utils.js';

// Get all doctors
export const getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find();

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});

// Get a single doctor
export const getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: doctor
  });
});

// Create a new doctor
export const createDoctor = catchAsync(async (req, res, next) => {
  // Add userId from authenticated user
  req.body.userId = req.user._id;
  
  const doctor = await Doctor.create(req.body);

  res.status(201).json({
    success: true,
    data: doctor
  });
});

// Update a doctor
export const updateDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: doctor
  });
});

// Delete a doctor
export const deleteDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(204).json({
    success: true,
    data: null
  });
});

// Get doctor's appointments
export const getDoctorAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({ doctorId: req.params.id })
    .populate('patientId', 'name email')
    .sort({ date: 1, startTime: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// Get available slots for a specific date
export const getAvailableSlots = catchAsync(async (req, res, next) => {
    const { date } = req.query;
    const doctorId = req.params.id;
    
    if (!date) {
      return next(new AppError('Please provide a date', 400));
    }
    
    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }
    
    // Convert the date string to a Date object
    const appointmentDate = new Date(date);
    // Get day name in lowercase (monday, tuesday, etc.)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[appointmentDate.getDay()];
    
    console.log("Doctor:", doctor.name);
    console.log("Working hours:", doctor.workingHours);
    console.log("Day of week:", dayOfWeek);
    
    // Check if the doctor works on this day
    if (!doctor.workingHours || !doctor.workingHours[dayOfWeek] || !doctor.workingHours[dayOfWeek].isWorking) {
      return res.status(200).json({
        success: true,
        message: 'Doctor does not work on this day',
        data: []
      });
    }
    
    // Get working hours for this day
    const workingHours = doctor.workingHours[dayOfWeek];
    const startTime = workingHours.start;
    const endTime = workingHours.end;
    
    // Calculate all possible slots based on doctor's slot duration (default to 30 min)
    const slotDuration = doctor.slotDuration || 30;
    const allPossibleSlots = [];
    
    let [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Convert to minutes for easier calculation
    let currentTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    
    // Generate all possible slots
    while (currentTimeInMinutes < endTimeInMinutes) {
      const hour = Math.floor(currentTimeInMinutes / 60);
      const minute = currentTimeInMinutes % 60;
      
      allPossibleSlots.push({
        startTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      });
      
      currentTimeInMinutes += slotDuration;
    }
    
    // Create new date objects for start and end of day to avoid mutating appointmentDate
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find existing appointments for this doctor on this date
    const existingAppointments = await Appointment.find({
      doctorId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    console.log("Existing appointments:", existingAppointments.length);
    
    // Filter out slots that overlap with existing appointments
    const availableSlots = allPossibleSlots.filter(slot => {
      const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
      const slotStartTime = slotHour * 60 + slotMinute;
      const slotEndTime = slotStartTime + slotDuration;
      
      // Check if this slot overlaps with any existing appointment
      return !existingAppointments.some(appointment => {
        const [appStartHour, appStartMinute] = appointment.startTime.split(':').map(Number);
        const [appEndHour, appEndMinute] = appointment.endTime.split(':').map(Number);
        
        const appStartTime = appStartHour * 60 + appStartMinute;
        const appEndTime = appEndHour * 60 + appEndMinute;
        
        // Check for overlap
        return (
          (slotStartTime >= appStartTime && slotStartTime < appEndTime) || 
          (slotEndTime > appStartTime && slotEndTime <= appEndTime) ||
          (slotStartTime <= appStartTime && slotEndTime >= appEndTime)
        );
      });
    });
    
    console.log("Available slots:", availableSlots.length);
    
    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  });

// Update doctor's working hours
export const updateWorkingHours = catchAsync(async (req, res, next) => {
  const { workingHours } = req.body;
  const doctorId = req.params.id;
  
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    { workingHours },
    { new: true, runValidators: true }
  );
  
  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    data: doctor
  });
});

// Get doctors by speciality
export const getDoctorsBySpeciality = catchAsync(async (req, res, next) => {
  const { speciality } = req.params;
  
  const doctors = await Doctor.find({ speciality });
  
  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});