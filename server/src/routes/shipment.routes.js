const express = require('express');
const { body } = require('express-validator');
const shipments = require('../controllers/shipment.controller');
const { protect, authorize, validate } = require('../middleware');

const router = express.Router();

const adminOnly = authorize('admin');
const validateCreateShipment = [
  body('orderId').notEmpty(),
  validate,
];

router.use(protect);
router.post('/create', adminOnly, validateCreateShipment, shipments.createShipment);
router.get('/:orderId', shipments.getShipment);
router.get('/:orderId/track', shipments.trackShipment);

module.exports = router;
