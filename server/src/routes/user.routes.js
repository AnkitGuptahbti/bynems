const express = require('express');
const { param } = require('express-validator');
const commerce = require('../controllers/commerce.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validateAddressId = [
  param('id').isMongoId(),
  validate,
];

router.use(protect);
router.get('/me', commerce.getProfile);
router.patch('/me', commerce.updateProfile);
router.get('/addresses', commerce.listAddresses);
router.post('/addresses', commerce.createAddress);
router.patch('/addresses/:id', validateAddressId, commerce.updateAddress);
router.delete('/addresses/:id', validateAddressId, commerce.deleteAddress);

module.exports = router;
