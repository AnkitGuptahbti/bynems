const express = require('express');
const { body } = require('express-validator');
const commerce = require('../controllers/commerce.controller');
const { validate } = require('../middleware');

const router = express.Router();

const validateCoupon = [
  body('code').notEmpty(),
  body('subtotal').isFloat({ min: 0 }),
  validate,
];

router.post('/validate', validateCoupon, commerce.validateCoupon);

module.exports = router;
