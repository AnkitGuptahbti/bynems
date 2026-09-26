const slugify = require('slugify');
const { Product, Category, Review } = require('../models');
const { ApiError, asyncHandler } = require('../utils');

const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  req.log.info({ operation: 'products.list', page, limit }, 'Controller invoked');
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
  const ratingRows = await Review.aggregate([
    { $match: { product: { $in: items.map((item) => item._id) }, $or: [{ status: 'APPROVED' }, { status: { $exists: false }, isApproved: true }] } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const ratings = new Map(ratingRows.map((row) => [String(row._id), row]));
  res.json({
    success: true,
    items: items.map((item) => {
      const row = ratings.get(String(item._id));
      return {
        ...item.toJSON(),
        rating: row ? Math.round(row.average * 10) / 10 : 0,
        reviewCount: row?.count || 0,
      };
    }),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

const getProduct = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'products.get', productLookup: req.params.id }, 'Controller invoked');
  const lookup = /^[a-f\d]{24}$/i.test(req.params.id) ? { _id: req.params.id } : { slug: req.params.id };
  const product = await Product.findOne({ ...lookup, isActive: true }).populate('category', 'name slug');
  if (!product) throw new ApiError(404, 'Product not found');
  const rating = await Review.aggregate([
    { $match: { product: product._id, $or: [{ status: 'APPROVED' }, { status: { $exists: false }, isApproved: true }] } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const stats = rating[0] || { average: 0, count: 0 };
  res.json({
    success: true,
    product: {
      ...product.toJSON(),
      rating: stats.average ? Math.round(stats.average * 10) / 10 : 0,
      reviewCount: stats.count || 0,
    },
  });
});

const createProduct = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'products.create', sku: req.body.sku, categoryId: req.body.category }, 'Controller invoked');
  const product = await Product.create({ ...req.body, slug: req.body.slug || slugify(req.body.name, { lower: true, strict: true }) });
  res.status(201).json({ success: true, product });
});

const updateProduct = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'products.update', productId: req.params.id }, 'Controller invoked');
  if (req.body.name && !req.body.slug) req.body.slug = slugify(req.body.name, { lower: true, strict: true });
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'products.archive', productId: req.params.id }, 'Controller invoked');
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, message: 'Product archived' });
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
