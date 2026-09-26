const express = require('express');
const { body, param } = require('express-validator');
const categories = require('../controllers/category.controller');
const { protect, authorize, validate } = require('../middleware');

const router = express.Router();

const adminOnly = [protect, authorize('admin')];
const validateCreateCategory = [
  body('name').trim().notEmpty(),
  validate,
];
const validateCategoryId = [
  param('id').isMongoId(),
  validate,
];

router.get('/', categories.listCategories);
router.post('/', adminOnly, validateCreateCategory, categories.createCategory);
router.patch('/:id', adminOnly, validateCategoryId, categories.updateCategory);
router.delete('/:id', adminOnly, validateCategoryId, categories.deleteCategory);

module.exports = router;
