const { Order, Product, User, Coupon, Category } = require('../models');
const { ApiError, asyncHandler } = require('../utils');
const { uploadMany } = require('../services/cloudinary.service');

const summary = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'admin.summary' }, 'Controller invoked');
  const [metrics, customers, products, lowStock, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalAmount', 0] } } } },
    ]),
    User.countDocuments({ role: 'customer', isActive: true }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, variants: { $elemMatch: { stock: { $lte: 5 } } } }),
    Order.find().populate('user', 'name email').sort('-createdAt').limit(10),
  ]);
  res.json({ success: true, summary: { orders: metrics[0]?.orders || 0, revenue: metrics[0]?.revenue || 0, customers, products, lowStock, recentOrders } });
});

const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  req.log.info({ operation: 'admin.listProducts', page, limit }, 'Controller invoked');
  const [products, total] = await Promise.all([
    Product.find().populate('category', 'name').sort('-createdAt').skip((page - 1) * limit).limit(limit),
    Product.countDocuments(),
  ]);
  res.json({ success: true, products, pagination: { page, limit, total } });
});

const listCategories = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'admin.listCategories' }, 'Controller invoked');
  const categories = await Category.find().sort('sortOrder name');
  res.json({ success: true, categories });
});

const listOrders = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'admin.listOrders', status: req.query.status }, 'Controller invoked');
  const filter = req.query.status ? { orderStatus: req.query.status } : {};
  const orders = await Order.find(filter).populate('user', 'name email phone').sort('-createdAt');
  res.json({ success: true, orders });
});

const updateOrder = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'admin.updateOrder', orderId: req.params.id }, 'Controller invoked');
  const allowed = ['orderStatus', 'shippingStatus', 'paymentStatus', 'awbNumber', 'courier', 'estimatedDelivery'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!order) throw new ApiError(404, 'Order not found');
  if (updates.orderStatus || updates.shippingStatus) {
    order.tracking.push({ status: updates.shippingStatus || updates.orderStatus, description: req.body.trackingDescription || 'Status updated by admin' });
    await order.save();
  }
  res.json({ success: true, order });
});

const uploadImages = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'admin.uploadImages', fileCount: req.files?.length || 0, folder: req.body.folder }, 'Controller invoked');
  if (!req.files?.length) throw new ApiError(422, 'At least one image is required');
  const images = await uploadMany(req.files, req.body.folder || 'bynemsteddy/products');
  res.status(201).json({ success: true, images });
});

const listCoupons = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'admin.listCoupons' }, 'Controller invoked');
  res.json({ success: true, coupons: await Coupon.find().sort('-createdAt') });
});
const createCoupon = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'admin.createCoupon', couponCode: req.body.code }, 'Controller invoked');
  res.status(201).json({ success: true, coupon: await Coupon.create(req.body) });
});
const updateCoupon = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'admin.updateCoupon', couponId: req.params.id }, 'Controller invoked');
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.json({ success: true, coupon });
});

module.exports = { summary, listProducts, listCategories, listOrders, updateOrder, uploadImages, listCoupons, createCoupon, updateCoupon };
