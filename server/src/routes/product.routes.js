const express = require('express');
const { query } = require('express-validator');
const catalog = require('../controllers/catalog.controller');
const { validate } = require('../middleware');

const router = express.Router();

const validateProductList = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
];

router.get('/', validateProductList, catalog.listProducts);
router.get('/:id', catalog.getProduct);

module.exports = router;
