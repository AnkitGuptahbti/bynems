const express = require('express');
const { body, param } = require('express-validator');
const cart = require('../controllers/cart.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validateAddItem = [
  body('productId').isMongoId(),
  body('variantId').isMongoId(),
  body('quantity').optional().isInt({ min: 1, max: 20 }),
  validate,
];
const validateUpdateItem = [
  param('itemId').isMongoId(),
  body('quantity').isInt({ min: 1, max: 20 }),
  validate,
];
const validateItemId = [
  param('itemId').isMongoId(),
  validate,
];
const validateCoupon = [
  body('code').trim().notEmpty(),
  validate,
];

router.use(protect);
router.get('/', cart.getCart);
router.post('/items', validateAddItem, cart.addItem);
router.patch('/items/:itemId', validateUpdateItem, cart.updateItem);
router.delete('/items/:itemId', validateItemId, cart.removeItem);
router.post('/coupon', validateCoupon, cart.applyCoupon);
router.delete('/', cart.clearCart);

module.exports = router;
