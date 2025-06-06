import Razorpay from 'razorpay';
import crypto from 'crypto';
import { TreatmentPlan } from '../models/treatmentPlan.model.js';

// Initialize Razorpay with error handling
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not found in environment variables');
  }
  
  razorpay = new Razorpay({
    key_id: "rzp_test_yMBJEWv59e57JT",
    key_secret: "1234567890"
  });
} catch (error) {
  console.error('Error initializing Razorpay:', error.message);
}

// Create payment order
export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment service is not configured properly'
      });
    }
    console.log("Razorpay initialized successfully"),req.body;
    const { treatmentPlanId } = req.body;

    // Get treatment plan details
    const treatmentPlan = await TreatmentPlan.findById(treatmentPlanId);
    if (!treatmentPlan) {
      return res.status(404).json({
        success: false,
        message: 'Treatment plan not found'
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: treatmentPlan.totalCost * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${treatmentPlanId}`,
      notes: {
        treatmentPlanId: treatmentPlanId
      }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order'
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Payment service is not configured properly'
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      treatmentPlanId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update treatment plan payment status
      await TreatmentPlan.findByIdAndUpdate(treatmentPlanId, {
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
}; 