const express = require('express');
const { body } = require('express-validator');
const commerce = require('../controllers/commerce.controller');
const { protect, authorize, validate } = require('../middleware');

const router = express.Router();

const adminOnly = authorize('admin');
const validateCreateShipment = [
  body('orderId').notEmpty(),
  validate,
];

router.use(protect);
router.post('/create', adminOnly, validateCreateShipment, commerce.createShipment);
router.get('/:orderId', commerce.getShipment);
router.get('/:orderId/track', commerce.trackShipment);

module.exports = router;
