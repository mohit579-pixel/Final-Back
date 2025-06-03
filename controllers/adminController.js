const User = require('../models/User');
const Staff = require('../models/Staff');
const Schedule = require('../models/Schedule');
const Protocol = require('../models/Protocol');
const Financial = require('../models/Financial');
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const adminController = {
  // Staff Management
  getStaff: asyncHandler(async (req, res) => {
    const staff = await Staff.find().populate('userId', 'fullName email');
    res.status(200).json({ success: true, data: staff });
  }),

  addStaff: asyncHandler(async (req, res) => {
    const staff = await Staff.create(req.body);
    res.status(201).json({ success: true, data: staff });
  }),

  updateStaff: asyncHandler(async (req, res) => {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!staff) {
      return next(new ErrorResponse('Staff not found', 404));
    }
    res.status(200).json({ success: true, data: staff });
  }),

  deleteStaff: asyncHandler(async (req, res) => {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return next(new ErrorResponse('Staff not found', 404));
    }
    res.status(200).json({ success: true, data: {} });
  }),

  getStaffStats: asyncHandler(async (req, res) => {
    const totalStaff = await Staff.countDocuments();
    const activeStaff = await Staff.countDocuments({ status: 'ACTIVE' });
    const roleDistribution = await Staff.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const departmentStats = await Staff.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStaff,
        activeStaff,
        roleDistribution,
        departmentStats
      }
    });
  }),

  // Schedule Management
  getSchedules: asyncHandler(async (req, res) => {
    const schedules = await Schedule.find()
      .populate('staffId', 'userId role')
      .populate('staffId.userId', 'fullName');
    res.status(200).json({ success: true, data: schedules });
  }),

  addSchedule: asyncHandler(async (req, res) => {
    const schedule = await Schedule.create(req.body);
    res.status(201).json({ success: true, data: schedule });
  }),

  updateSchedule: asyncHandler(async (req, res) => {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!schedule) {
      return next(new ErrorResponse('Schedule not found', 404));
    }
    res.status(200).json({ success: true, data: schedule });
  }),

  deleteSchedule: asyncHandler(async (req, res) => {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return next(new ErrorResponse('Schedule not found', 404));
    }
    res.status(200).json({ success: true, data: {} });
  }),

  // Clinic Operations
  getAppointments: asyncHandler(async (req, res) => {
    const appointments = await Appointment.find()
      .populate('patientId', 'fullName')
      .populate('doctorId', 'userId')
      .populate('doctorId.userId', 'fullName');
    res.status(200).json({ success: true, data: appointments });
  }),

  addAppointment: asyncHandler(async (req, res) => {
    const appointment = await Appointment.create(req.body);
    res.status(201).json({ success: true, data: appointment });
  }),

  updateAppointment: asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }
    res.status(200).json({ success: true, data: appointment });
  }),

  deleteAppointment: asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }
    res.status(200).json({ success: true, data: {} });
  }),

  // Inventory Management
  getInventory: asyncHandler(async (req, res) => {
    const inventory = await Inventory.find();
    res.status(200).json({ success: true, data: inventory });
  }),

  addInventoryItem: asyncHandler(async (req, res) => {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  }),

  updateInventoryItem: asyncHandler(async (req, res) => {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return next(new ErrorResponse('Inventory item not found', 404));
    }
    res.status(200).json({ success: true, data: item });
  }),

  deleteInventoryItem: asyncHandler(async (req, res) => {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      return next(new ErrorResponse('Inventory item not found', 404));
    }
    res.status(200).json({ success: true, data: {} });
  }),

  // Room Management
  getRooms: asyncHandler(async (req, res) => {
    const rooms = await Room.find();
    res.status(200).json({ success: true, data: rooms });
  }),

  addRoom: asyncHandler(async (req, res) => {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  }),

  updateRoom: asyncHandler(async (req, res) => {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!room) {
      return next(new ErrorResponse('Room not found', 404));
    }
    res.status(200).json({ success: true, data: room });
  }),

  deleteRoom: asyncHandler(async (req, res) => {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return next(new ErrorResponse('Room not found', 404));
    }
    res.status(200).json({ success: true, data: {} });
  }),

  // Financial Management
  getFinancial: asyncHandler(async (req, res) => {
    const { timeRange } = req.query;
    let query = {};
    
    if (timeRange) {
      const date = new Date();
      switch (timeRange) {
        case 'week':
          date.setDate(date.getDate() - 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      query.date = { $gte: date };
    }

    const financial = await Financial.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, data: financial });
  }),

  addFinancial: asyncHandler(async (req, res) => {
    const financial = await Financial.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: financial });
  }),

  updateFinancial: asyncHandler(async (req, res) => {
    const financial = await Financial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!financial) {
      return next(new ErrorResponse('Financial record not found', 404));
    }
    res.status(200).json({ success: true, data: financial });
  }),

  deleteFinancial: asyncHandler(async (req, res) => {
    const financial = await Financial.findByIdAndDelete(req.params.id);
    if (!financial) {
      return next(new ErrorResponse('Financial record not found', 404));
    }
    res.status(200).json({ success: true, data: {} });
  }),

  getFinancialStats: asyncHandler(async (req, res) => {
    const { timeRange } = req.query;
    let query = {};
    
    if (timeRange) {
      const date = new Date();
      switch (timeRange) {
        case 'week':
          date.setDate(date.getDate() - 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      query.date = { $gte: date };
    }

    const [revenue, expenses] = await Promise.all([
      Financial.aggregate([
        { $match: { ...query, type: 'INCOME' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Financial.aggregate([
        { $match: { ...query, type: 'EXPENSE' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const revenueByCategory = await Financial.aggregate([
      { $match: { ...query, type: 'INCOME' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const monthlyData = await Financial.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$type', 'INCOME'] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenue[0]?.total || 0,
        totalExpenses: expenses[0]?.total || 0,
        revenueByCategory,
        monthlyData
      }
    });
  }),

  // Invoice Management
  getInvoices: asyncHandler(async (req, res) => {
    const { timeRange } = req.query;
    let query = {};
    
    if (timeRange) {
      const date = new Date();
      switch (timeRange) {
        case 'week':
          date.setDate(date.getDate() - 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      query.date = { $gte: date };
    }

    const invoices = await Invoice.find(query)
      .populate('patientId', 'fullName')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: invoices });
  }),

  addInvoice: asyncHandler(async (req, res) => {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  }),

  updateInvoice: asyncHandler(async (req, res) => {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!invoice) {
      return next(new ErrorResponse('Invoice not found', 404));
    }
    res.status(200).json({ success: true, data: invoice });
  }),

  deleteInvoice: asyncHandler(async (req, res) => {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return next(new ErrorResponse('Invoice not found', 404));
    }
    res.status(200).json({ success: true, data: {} });
  }),

  // Payment Management
  getPayments: asyncHandler(async (req, res) => {
    const payments = await Payment.find()
      .populate('invoiceId')
      .populate('patientId', 'fullName')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: payments });
  }),

  addPayment: asyncHandler(async (req, res) => {
    const payment = await Payment.create(req.body);
    res.status(201).json({ success: true, data: payment });
  }),

  updatePayment: asyncHandler(async (req, res) => {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }
    res.status(200).json({ success: true, data: payment });
  }),

  deletePayment: asyncHandler(async (req, res) => {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }
    res.status(200).json({ success: true, data: {} });
  })
};

module.exports = adminController; 