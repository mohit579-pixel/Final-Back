import express from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getDoctorAvailableSlots,
  deleteAppointment
} from '../controller/appointment.controller.js';
import { isLoggedIn, isAdmin, isDoctor, isPatient, isAuthorized } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/available-slots', getDoctorAvailableSlots); // Allow checking availability without login

// Protected routes - require authentication
router.use(isLoggedIn);

// Routes for patients
router.get('/patient/:patientId', getPatientAppointments);
router.post('/create', createAppointment);

// Routes that need specific resource authorization
router.get('/:id', getAppointmentById);
router.patch('/cancel/:id', isLoggedIn,cancelAppointment);
router.put('/:id', isAuthorized, updateAppointment); 

// Doctor routes
router.get('/doctor/:doctorId', getDoctorAppointments);

// Admin routes
router.get('/', isAdmin, getAllAppointments);
router.delete('/:id', isAdmin, deleteAppointment);

export default router;