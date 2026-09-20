const express = require('express');
const { body } = require('express-validator');
const commerce = require('../controllers/commerce.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validateCreatePayment = [
  body('orderId').trim().notEmpty(),
  validate,
];
const validatePaymentVerification = [
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty(),
  validate,
];

router.use(protect);
router.post('/create', validateCreatePayment, commerce.createPayment);
router.post('/verify', validatePaymentVerification, commerce.verifyPayment);

module.exports = router;
