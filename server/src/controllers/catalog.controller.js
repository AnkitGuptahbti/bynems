const slugify = require('slugify');
const { Product, Category, Review } = require('../models');
const { ApiError, asyncHandler } = require('../utils');

const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  req.log.info({ operation: 'catalog.listProducts', page, limit }, 'Controller invoked');
  const filter = { isActive: true };
  if (req.query.category) {
    const category = await Category.findOne({ $or: [{ slug: req.query.category }, { _id: /^[a-f\d]{24}$/i.test(req.query.category) ? req.query.category : null }] });
    filter.category = category?._id || null;
  }
  if (req.query.search) filter.$text = { $search: req.query.search };
  if (req.query.featured === 'true') filter.featured = true;
  if (req.query.bestseller === 'true') filter.bestseller = true;
  const sort = ['price', '-price', 'createdAt', '-createdAt'].includes(req.query.sort) ? req.query.sort : '-createdAt';
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ success: true, items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const getProduct = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'catalog.getProduct', productLookup: req.params.id }, 'Controller invoked');
  const lookup = /^[a-f\d]{24}$/i.test(req.params.id) ? { _id: req.params.id } : { slug: req.params.id };
  const product = await Product.findOne({ ...lookup, isActive: true }).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  const rating = await Review.aggregate([
    { $match: { product: product._id, isApproved: true } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  res.json({ success: true, product, rating: rating[0] || { average: 0, count: 0 } });
});

const listCategories = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'catalog.listCategories' }, 'Controller invoked');
  const categories = await Category.find({ isActive: true }).sort('sortOrder name');
  res.json({ success: true, categories });
});

const createProduct = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'catalog.createProduct', sku: req.body.sku, categoryId: req.body.category }, 'Controller invoked');
  const product = await Product.create({ ...req.body, slug: req.body.slug || slugify(req.body.name, { lower: true, strict: true }) });
  res.status(201).json({ success: true, product });
});
const updateProduct = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'catalog.updateProduct', productId: req.params.id }, 'Controller invoked');
  if (req.body.name && !req.body.slug) req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});
const deleteProduct = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'catalog.archiveProduct', productId: req.params.id }, 'Controller invoked');
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, message: 'Product archived' });
});
const createCategory = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'catalog.createCategory', categoryName: req.body.name }, 'Controller invoked');
  const category = await Category.create({ ...req.body, slug: req.body.slug || slugify(req.body.name, { lower: true, strict: true }) });
  res.status(201).json({ success: true, category });
});
const updateCategory = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'catalog.updateCategory', categoryId: req.params.id }, 'Controller invoked');
  if (req.body.name && !req.body.slug) req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, category });
});
const deleteCategory = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'catalog.archiveCategory', categoryId: req.params.id }, 'Controller invoked');
  const productCount = await Product.countDocuments({ category: req.params.id, isActive: true });
  if (productCount) throw new ApiError(409, `Archive or move ${productCount} active product(s) before archiving this category`);
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, message: 'Category archived' });
});

module.exports = { listProducts, getProduct, listCategories, createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory };
