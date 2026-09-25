const express = require('express');
const { body } = require('express-validator');
const commerce = require('../controllers/commerce.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validateCreatePayment = [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
  validate,
];
const validatePaymentVerification = [
  body('razorpay_order_id').notEmpty().withMessage('Payment order is missing'),
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID is missing'),
  body('razorpay_signature').notEmpty().withMessage('Payment signature is missing'),
  validate,
];

router.use(protect);
router.post('/create', validateCreatePayment, commerce.createPayment);
router.post('/verify', validatePaymentVerification, commerce.verifyPayment);

module.exports = router;
