const express = require('express');
const { body, param } = require('express-validator');
const commerce = require('../controllers/commerce.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validateProductId = [
  param('productId').isMongoId(),
  validate,
];
const validateCreateReview = [
  param('productId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().isLength({ min: 3, max: 2000 }),
  validate,
];

router.get('/:productId', validateProductId, commerce.listReviews);
router.post('/:productId', protect, validateCreateReview, commerce.createReview);

module.exports = router;
