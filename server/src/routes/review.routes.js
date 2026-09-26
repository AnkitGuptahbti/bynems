const express = require('express');
const { body, param } = require('express-validator');
const reviews = require('../controllers/review.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validateProductId = [
  param('productId').isMongoId().withMessage('Product not found'),
  validate,
];
const validateCreateReview = [
  param('productId').isMongoId().withMessage('Product not found'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Choose a rating from 1 to 5'),
  body('comment').trim().isLength({ min: 3, max: 2000 }).withMessage('Write a short review'),
  validate,
];

router.get('/mine', protect, reviews.listMyReviews);
router.get('/:productId/eligibility', protect, validateProductId, reviews.getReviewEligibility);
router.get('/:productId', validateProductId, reviews.listReviews);
router.post('/:productId', protect, validateCreateReview, reviews.createReview);

module.exports = router;
