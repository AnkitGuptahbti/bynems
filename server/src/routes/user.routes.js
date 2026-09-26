const express = require('express');
const { body, param } = require('express-validator');
const users = require('../controllers/user.controller');
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
router.get('/me', users.getProfile);
router.patch('/me', validateProfile, users.updateProfile);
router.get('/addresses', users.listAddresses);
router.post('/addresses', validateAddress, users.createAddress);
router.patch('/addresses/:id', validateAddressId, validateAddress, users.updateAddress);
router.delete('/addresses/:id', validateAddressId, users.deleteAddress);

module.exports = router;
