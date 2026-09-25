const express = require('express');
const { body, param } = require('express-validator');
const commerce = require('../controllers/commerce.controller');
const { protect, validate } = require('../middleware');
const { addressValidators, indianPhone } = require('../validators/common');

const router = express.Router();

const validateProfile = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Enter a valid full name'),
  indianPhone('phone', { optional: true }),
  validate,
];
const validateAddress = [
  ...addressValidators(),
  validate,
];
const validateAddressId = [
  param('id').isMongoId().withMessage('Address not found'),
  validate,
];

router.use(protect);
router.get('/me', commerce.getProfile);
router.patch('/me', validateProfile, commerce.updateProfile);
router.get('/addresses', commerce.listAddresses);
router.post('/addresses', validateAddress, commerce.createAddress);
router.patch('/addresses/:id', validateAddressId, validateAddress, commerce.updateAddress);
router.delete('/addresses/:id', validateAddressId, commerce.deleteAddress);

module.exports = router;
