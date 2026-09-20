const { Order, Payment, Shipment, Coupon, Review, Address, User } = require('../models');
const { ApiError, asyncHandler, calculateCouponDiscount } = require('../utils');
const razorpay = require('../services/razorpay.service');
const nimbuspost = require('../services/nimbuspost.service');
const { dispatchShipment } = require('./order.controller');

const createPayment = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'payments.create', orderId: req.body.orderId }, 'Controller invoked');
  const order = await Order.findOne({ orderId: req.body.orderId, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.paymentMethod !== 'ONLINE' || order.paymentStatus === 'PAID') throw new ApiError(422, 'Order is not eligible for online payment');
  const providerOrder = await razorpay.createPaymentOrder({ amount: order.totalAmount, receipt: order.orderId, notes: { internalOrderId: order.orderId } });
  order.razorpayOrderId = providerOrder.id;
  await order.save();
  await Payment.findOneAndUpdate(
    { order: order._id },
    { providerOrderId: providerOrder.id, amount: order.totalAmount, status: 'created', raw: providerOrder },
    { upsert: true, new: true }
  );
  req.log.info({
    orderId: order.orderId,
    providerOrderId: providerOrder.id,
    amount: order.totalAmount,
  }, 'Razorpay order created');
  res.status(201).json({ success: true, payment: { keyId: process.env.RAZORPAY_KEY_ID, orderId: providerOrder.id, amount: providerOrder.amount, currency: providerOrder.currency } });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id: providerOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
  req.log.info({ operation: 'payments.verify', providerOrderId, providerPaymentId: paymentId }, 'Controller invoked');
  const order = await Order.findOne({ razorpayOrderId: providerOrderId, user: req.user._id });
  if (!order) throw new ApiError(404, 'Order not found');
  if (!razorpay.verifyPaymentSignature({ razorpayOrderId: providerOrderId, razorpayPaymentId: paymentId, signature })) {
    await Payment.findOneAndUpdate({ order: order._id }, { status: 'failed' });
    throw new ApiError(400, 'Payment signature verification failed');
  }
  order.paymentStatus = 'PAID';
  order.orderStatus = 'CONFIRMED';
  order.razorpayPaymentId = paymentId;
  order.tracking.push({ status: 'CONFIRMED', description: 'Payment verified and order confirmed' });
  await order.save();
  await Payment.findOneAndUpdate({ order: order._id }, { providerPaymentId: paymentId, status: 'captured' });
  if (nimbuspost.configured) {
    try {
      await dispatchShipment(order);
    } catch (error) {
      req.log.error({ err: error, orderId: order.orderId }, 'Shipment creation deferred after payment');
    }
  }
  req.log.info({
    orderId: order.orderId,
    providerOrderId,
    providerPaymentId: paymentId,
  }, 'Payment verified');
  res.json({ success: true, order, shipmentDeferred: !nimbuspost.configured });
});

const createShipment = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'shipments.create', orderId: req.body.orderId }, 'Controller invoked');
  const order = await Order.findOne({ orderId: req.body.orderId });
  if (!order) throw new ApiError(404, 'Order not found');
  const shipment = await dispatchShipment(order);
  res.status(201).json({ success: true, shipment, message: shipment ? undefined : 'Shipment already exists' });
});
const getShipment = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'shipments.get', orderId: req.params.orderId }, 'Controller invoked');
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) throw new ApiError(404, 'Order not found');
  const shipment = await Shipment.findOne({ order: order._id });
  if (!shipment) throw new ApiError(404, 'Shipment not found');
  res.json({ success: true, shipment });
});
const trackShipment = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'shipments.track', orderId: req.params.orderId }, 'Controller invoked');
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order?.awbNumber) throw new ApiError(404, 'Tracking is not available yet');
  if (!nimbuspost.configured) return res.json({ success: true, source: 'cached', tracking: order.tracking, shippingStatus: order.shippingStatus });
  const tracking = await nimbuspost.trackShipment(order.awbNumber);
  res.json({ success: true, source: 'live', tracking });
});

const validateCoupon = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'coupons.validate', couponCode: req.body.code }, 'Controller invoked');
  const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true });
  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) throw new ApiError(422, 'Coupon is invalid or expired');
  const subtotal = Number(req.body.subtotal);
  if (subtotal < coupon.minOrderAmount) throw new ApiError(422, `Minimum order amount is ₹${coupon.minOrderAmount}`);
  res.json({ success: true, coupon: { code: coupon.code, discount: calculateCouponDiscount(coupon, subtotal) } });
});

const listReviews = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'reviews.list', productId: req.params.productId }, 'Controller invoked');
  const reviews = await Review.find({ product: req.params.productId, isApproved: true }).populate('user', 'name').sort('-createdAt');
  res.json({ success: true, reviews });
});
const createReview = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'reviews.create', productId: req.params.productId, rating: req.body.rating }, 'Controller invoked');
  const delivered = await Order.findOne({ user: req.user._id, orderStatus: 'DELIVERED', 'items.product': req.params.productId });
  if (!delivered) throw new ApiError(403, 'Only verified buyers can review this product');
  const review = await Review.create({ ...req.body, product: req.params.productId, user: req.user._id, order: delivered._id });
  res.status(201).json({ success: true, review });
});

const getProfile = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'profile.get' }, 'Controller invoked');
  res.json({ success: true, user: req.user });
});
const updateProfile = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'profile.update' }, 'Controller invoked');
  const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, phone: req.body.phone }, { new: true, runValidators: true });
  res.json({ success: true, user });
});
const listAddresses = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'addresses.list' }, 'Controller invoked');
  res.json({ success: true, addresses: await Address.find({ user: req.user._id }).sort('-isDefault') });
});
const createAddress = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'addresses.create', label: req.body.label }, 'Controller invoked');
  if (req.body.isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, address });
});
const updateAddress = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'addresses.update', addressId: req.params.id }, 'Controller invoked');
  if (req.body.isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
  if (!address) throw new ApiError(404, 'Address not found');
  res.json({ success: true, address });
});
const deleteAddress = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'addresses.delete', addressId: req.params.id }, 'Controller invoked');
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw new ApiError(404, 'Address not found');
  res.json({ success: true, message: 'Address deleted' });
});

module.exports = { createPayment, verifyPayment, createShipment, getShipment, trackShipment, validateCoupon, listReviews, createReview, getProfile, updateProfile, listAddresses, createAddress, updateAddress, deleteAddress };
