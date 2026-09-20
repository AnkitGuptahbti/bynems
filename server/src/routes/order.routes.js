const express = require('express');
const { body, query } = require('express-validator');
const orders = require('../controllers/order.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validatePublicTracking = [
  query('phone').trim().notEmpty(),
  validate,
];
const validateCreateOrder = [
  body('paymentMethod').equals('ONLINE').withMessage('Only online payment is currently available'),
  body('shippingAddress.fullName').trim().notEmpty(),
  body('shippingAddress.phone').trim().notEmpty(),
  body('shippingAddress.address').trim().notEmpty(),
  body('shippingAddress.city').trim().notEmpty(),
  body('shippingAddress.state').trim().notEmpty(),
  body('shippingAddress.pincode').matches(/^\d{6}$/),
  validate,
];

router.get('/track/:orderId', validatePublicTracking, orders.publicTracking);
router.use(protect);
router.post('/', validateCreateOrder, orders.createOrder);
router.get('/', orders.listOrders);
router.get('/:id', orders.getOrder);

module.exports = router;
