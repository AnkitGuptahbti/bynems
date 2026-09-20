const express = require('express');
const { body, param } = require('express-validator');
const admin = require('../controllers/admin.controller');
const catalog = require('../controllers/catalog.controller');
const { protect, authorize, validate, upload } = require('../middleware');

const router = express.Router();

const adminOnly = [protect, authorize('admin')];
const validateCreateProduct = [
  body('name').trim().notEmpty(),
  body('sku').trim().notEmpty(),
  body('category').isMongoId(),
  body('price').isFloat({ min: 0 }),
  body('mrp').isFloat({ min: 0 }),
  body('description').trim().notEmpty(),
  body('images').isArray({ min: 1 }),
  body('variants').isArray({ min: 1 }),
  body('variants.*.label').trim().notEmpty(),
  body('variants.*.color').trim().notEmpty(),
  body('variants.*.lengthCm').isFloat({ min: 0.1 }),
  body('variants.*.breadthCm').isFloat({ min: 0.1 }),
  body('variants.*.heightCm').isFloat({ min: 0.1 }),
  body('variants.*.weightGrams').isFloat({ min: 1 }),
  body('variants.*.stock').isInt({ min: 0 }),
  body('variants.*.price').isFloat({ min: 0 }),
  body('variants.*.sku').trim().notEmpty(),
  body('variants.*.images').optional().isArray(),
  body('variants.*.images.*.url').optional().isURL(),
  validate,
];
const validateProductId = [
  param('id').isMongoId(),
  validate,
];
const validateCreateCategory = [
  body('name').trim().notEmpty(),
  body('image.url').isURL(),
  validate,
];
const validateCategoryId = [
  param('id').isMongoId(),
  validate,
];
const validateOrderId = [
  param('id').isMongoId(),
  validate,
];
const validateCouponId = [
  param('id').isMongoId(),
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
