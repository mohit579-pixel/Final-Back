import express from 'express';
import {getAllDoctors, getDoctor, getDoctorsBySpeciality, getAvailableSlots, createDoctor, updateDoctor, deleteDoctor, updateWorkingHours, getDoctorAppointments} from '../controller/doctor.controller.js'; 
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Helper function to wrap async controllers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public routes
router.get('/', asyncHandler(getAllDoctors));
router.get('/:id', asyncHandler(getDoctor));
router.get('/speciality/:speciality', asyncHandler(getDoctorsBySpeciality));
router.get('/:id/available-slots', asyncHandler(getAvailableSlots));

// Protected routes (require authentication)
router.use(authMiddleware.isLoggedIn);

// Only admins can create doctors
router.post('/', createDoctor);

// Doctor or admin can update doctor profile
router.patch('/:id', updateDoctor);

// Only admin can delete a doctor
router.delete('/:id', authMiddleware.isAdmin, asyncHandler(deleteDoctor));

// Doctor can update their working hours
// router.patch('/:id/working-hours', authMiddleware.isAuthorized(['admin', 'doctor']), asyncHandler(updateWorkingHours));

// Get doctor appointments (accessible by the doctor themselves or admin)
router.get('/:id/appointments', asyncHandler(getDoctorAppointments));

export default router;