import express from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/payment.controller.js';
import { isAuthorized } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create payment order
router.post('/create-order', isAuthorized, createPaymentOrder);

// Verify payment
router.post('/verify', isAuthorized, verifyPayment);

export default router; 