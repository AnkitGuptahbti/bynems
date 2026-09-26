const slugify = require('slugify');
const { Product, Category } = require('../models');
const { ApiError, asyncHandler } = require('../utils');

const listCategories = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'categories.list' }, 'Controller invoked');
  const categories = await Category.find({ isActive: true }).sort('sortOrder name');
  res.json({ success: true, categories });
});

const createCategory = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'categories.create', categoryName: req.body.name }, 'Controller invoked');
  const category = await Category.create({ ...req.body, slug: req.body.slug || slugify(req.body.name, { lower: true, strict: true }) });
  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'categories.update', categoryId: req.params.id }, 'Controller invoked');
  if (req.body.name && !req.body.slug) req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'categories.archive', categoryId: req.params.id }, 'Controller invoked');
  const productCount = await Product.countDocuments({ category: req.params.id, isActive: true });
  if (productCount) throw new ApiError(409, `Archive or move ${productCount} active product(s) before archiving this category`);
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) throw new ApiError(404, 'Category not found');
  res.json({ success: true, message: 'Category archived' });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
