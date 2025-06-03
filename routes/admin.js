const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Protect all admin routes
router.use(protect);
router.use(authorize('ADMIN'));

// Staff Management Routes
router.get('/staff', adminController.getStaff);
router.post('/staff', adminController.addStaff);
router.put('/staff/:id', adminController.updateStaff);
router.delete('/staff/:id', adminController.deleteStaff);
router.get('/staff/stats', adminController.getStaffStats);

// Schedule Management Routes
router.get('/schedules', adminController.getSchedules);
router.post('/schedules', adminController.addSchedule);
router.put('/schedules/:id', adminController.updateSchedule);
router.delete('/schedules/:id', adminController.deleteSchedule);

// Clinic Operations Routes
router.get('/appointments', adminController.getAppointments);
router.post('/appointments', adminController.addAppointment);
router.put('/appointments/:id', adminController.updateAppointment);
router.delete('/appointments/:id', adminController.deleteAppointment);

router.get('/inventory', adminController.getInventory);
router.post('/inventory', adminController.addInventoryItem);
router.put('/inventory/:id', adminController.updateInventoryItem);
router.delete('/inventory/:id', adminController.deleteInventoryItem);

router.get('/rooms', adminController.getRooms);
router.post('/rooms', adminController.addRoom);
router.put('/rooms/:id', adminController.updateRoom);
router.delete('/rooms/:id', adminController.deleteRoom);

// Financial Management Routes
router.get('/financial', adminController.getFinancial);
router.post('/financial', adminController.addFinancial);
router.put('/financial/:id', adminController.updateFinancial);
router.delete('/financial/:id', adminController.deleteFinancial);
router.get('/financial/stats', adminController.getFinancialStats);

router.get('/invoices', adminController.getInvoices);
router.post('/invoices', adminController.addInvoice);
router.put('/invoices/:id', adminController.updateInvoice);
router.delete('/invoices/:id', adminController.deleteInvoice);

router.get('/payments', adminController.getPayments);
router.post('/payments', adminController.addPayment);
router.put('/payments/:id', adminController.updatePayment);
router.delete('/payments/:id', adminController.deletePayment);

module.exports = router; 