const express = require('express');
const { query } = require('express-validator');
const products = require('../controllers/product.controller');
const { validate } = require('../middleware');

const router = express.Router();

const validateProductList = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
];

router.get('/', validateProductList, products.listProducts);
router.get('/:id', products.getProduct);

module.exports = router;
