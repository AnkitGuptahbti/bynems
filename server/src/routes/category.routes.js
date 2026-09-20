const express = require('express');
const { body, param } = require('express-validator');
const catalog = require('../controllers/catalog.controller');
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

router.get('/', catalog.listCategories);
router.post('/', adminOnly, validateCreateCategory, catalog.createCategory);
router.patch('/:id', adminOnly, validateCategoryId, catalog.updateCategory);
router.delete('/:id', adminOnly, validateCategoryId, catalog.deleteCategory);

module.exports = router;
