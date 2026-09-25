const express = require('express');
const { body, param } = require('express-validator');
const admin = require('../controllers/admin.controller');
const catalog = require('../controllers/catalog.controller');
const { protect, authorize, validate, upload } = require('../middleware');

const router = express.Router();

const adminOnly = [protect, authorize('admin')];
const validateCreateProduct = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Enter a product name'),
  body('sku').trim().notEmpty().withMessage('Enter a product SKU'),
  body('category').isMongoId().withMessage('Select a category'),
  body('price').isFloat({ min: 0 }).withMessage('Enter a valid selling price'),
  body('mrp').isFloat({ min: 0 }).withMessage('Enter a valid MRP'),
  body('description').trim().isLength({ min: 10 }).withMessage('Enter a product description'),
  body('images').isArray({ min: 1 }).withMessage('Upload at least one product image'),
  body('variants').isArray({ min: 1 }).withMessage('Add at least one product variant'),
  body('variants.*.label').trim().notEmpty().withMessage('Each variant needs a size label'),
  body('variants.*.color').trim().notEmpty().withMessage('Each variant needs a colour'),
  body('variants.*.lengthCm').isFloat({ min: 0.1 }).withMessage('Enter a valid length'),
  body('variants.*.breadthCm').isFloat({ min: 0.1 }).withMessage('Enter a valid breadth'),
  body('variants.*.heightCm').isFloat({ min: 0.1 }).withMessage('Enter a valid height'),
  body('variants.*.weightGrams').isFloat({ min: 1 }).withMessage('Enter a valid weight in grams'),
  body('variants.*.stock').isInt({ min: 0 }).withMessage('Stock cannot be negative'),
  body('variants.*.price').isFloat({ min: 0 }).withMessage('Enter a valid variant price'),
  body('variants.*.sku').trim().notEmpty().withMessage('Each variant needs a SKU'),
  body('variants.*.images').optional().isArray(),
  body('variants.*.images.*.url').optional().isURL().withMessage('Variant image URL is invalid'),
  validate,
];
const validateProductId = [
  param('id').isMongoId().withMessage('Product not found'),
  validate,
];
const validateCreateCategory = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Enter a category name'),
  body('image.url').isURL().withMessage('Upload a category image'),
  validate,
];
const validateCategoryId = [
  param('id').isMongoId().withMessage('Category not found'),
  validate,
];
const validateOrderId = [
  param('id').isMongoId().withMessage('Order not found'),
  validate,
];
const validateCouponId = [
  param('id').isMongoId().withMessage('Coupon not found'),
  validate,
];
const uploadProductImages = upload.array('images', 10);

router.use(adminOnly);
router.get('/summary', admin.summary);
router.get('/products', admin.listProducts);
router.post('/products', validateCreateProduct, catalog.createProduct);
router.patch('/products/:id', validateProductId, validateCreateProduct, catalog.updateProduct);
router.delete('/products/:id', validateProductId, catalog.deleteProduct);

router.get('/categories', admin.listCategories);
router.post('/categories', validateCreateCategory, catalog.createCategory);
router.patch('/categories/:id', validateCategoryId, catalog.updateCategory);
router.delete('/categories/:id', validateCategoryId, catalog.deleteCategory);

router.get('/orders', admin.listOrders);
router.patch('/orders/:id', validateOrderId, admin.updateOrder);
router.post('/uploads', uploadProductImages, admin.uploadImages);

router.get('/coupons', admin.listCoupons);
router.post('/coupons', admin.createCoupon);
router.patch('/coupons/:id', validateCouponId, admin.updateCoupon);

module.exports = router;
