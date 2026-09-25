const express = require('express');
const { body, param } = require('express-validator');
const orders = require('../controllers/order.controller');
const { protect, validate } = require('../middleware');
const { addressValidators, trackPhone } = require('../validators/common');

const router = express.Router();

const validatePublicTracking = [
  param('orderId').trim().isLength({ min: 6, max: 40 }).withMessage('Enter a valid order ID'),
  trackPhone,
  validate,
];
const validateCreateOrder = [
  body('paymentMethod').equals('ONLINE').withMessage('Only online payment is currently available'),
  ...addressValidators('shippingAddress'),
  validate,
];

router.get('/track/:orderId', validatePublicTracking, orders.publicTracking);
router.use(protect);
router.post('/', validateCreateOrder, orders.createOrder);
router.get('/', orders.listOrders);
router.get('/:id', orders.getOrder);

module.exports = router;
