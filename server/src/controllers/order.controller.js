const mongoose = require('mongoose');
const { Cart, Order, Product, Coupon, Shipment } = require('../models');
const { env } = require('../config');
const { logger } = require('../config/logger');
const { ApiError, asyncHandler, createOrderId, calculateCouponDiscount } = require('../utils');
const nimbuspost = require('../services/nimbuspost.service');

function shipmentPayload(order) {
  return {
    order_number: order.orderId,
    payment_type: order.paymentMethod === 'COD' ? 'cod' : 'prepaid',
    order_amount: order.totalAmount,
    consignee: order.shippingAddress,
    products: order.items.map((item) => ({ name: item.name, sku: item.sku, quantity: item.quantity, price: item.unitPrice })),
  };
}

async function dispatchShipment(order) {
  logger.info({ operation: 'shipping.dispatch', orderId: order.orderId }, 'Controller service invoked');
  if (order.paymentStatus !== 'PAID') throw new ApiError(422, 'Shipment cannot be created before payment');
  if (!nimbuspost.configured || order.awbNumber) {
    logger.info({ operation: 'shipping.dispatch', orderId: order.orderId, skipped: true }, 'Shipment dispatch skipped');
    return null;
  }
  const result = await nimbuspost.createShipment(shipmentPayload(order));
  const data = result.data || result;
  const shipment = await Shipment.findOneAndUpdate(
    { order: order._id },
    {
      providerOrderId: data.order_id || data.id, awbNumber: data.awb_number || data.awb,
      courier: data.courier_name || data.courier, status: data.status || 'CREATED', raw: data,
    },
    { upsert: true, new: true }
  );
  Object.assign(order, {
    nimbusOrderId: shipment.providerOrderId, awbNumber: shipment.awbNumber,
    courier: shipment.courier, shippingStatus: shipment.status,
  });
  await order.save();
  logger.info({ operation: 'shipping.dispatch', orderId: order.orderId, awbNumber: shipment.awbNumber }, 'Shipment dispatched');
  return shipment;
}

const createOrder = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'orders.create' }, 'Controller invoked');
  if (req.body.paymentMethod !== 'ONLINE') throw new ApiError(422, 'Cash on Delivery is currently unavailable');
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');
  if (!cart?.items.length) throw new ApiError(422, 'Cart is empty');
  const session = await mongoose.startSession();
  let order;
  try {
    await session.withTransaction(async () => {
      const items = [];
      for (const item of cart.items) {
        const product = item.product;
        const variant = product?.variants?.id(item.variantId)
          || product?.variants?.find((entry) => String(entry._id) === String(item.variantId))
          || product?.variants?.find((entry) => entry.label === item.size && (!item.color || entry.color === item.color));
        if (!product?.isActive || !variant || variant.stock < item.quantity) throw new ApiError(409, `${product?.name || 'Product'} is unavailable`);
        const unitPrice = variant.price ?? product.price;
        items.push({
          product: product._id, name: product.name, image: variant.images?.[0]?.url || product.images[0]?.url,
          variantId: variant._id, size: variant.label, color: variant.color,
          lengthCm: variant.lengthCm, breadthCm: variant.breadthCm, heightCm: variant.heightCm,
          weightGrams: variant.weightGrams, sku: variant.sku || product.sku,
          quantity: item.quantity, unitPrice, total: unitPrice * item.quantity,
        });
        const stockResult = await Product.updateOne(
          { _id: product._id, variants: { $elemMatch: { _id: variant._id, stock: { $gte: item.quantity } } } },
          { $inc: { 'variants.$.stock': -item.quantity } },
          { session }
        );
        if (!stockResult.modifiedCount) throw new ApiError(409, `${product.name} is unavailable`);
      }
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const coupon = cart.coupon && cart.coupon.isActive && (!cart.coupon.expiresAt || cart.coupon.expiresAt > new Date()) ? cart.coupon : null;
      const discount = subtotal >= (coupon?.minOrderAmount || 0) ? calculateCouponDiscount(coupon, subtotal) : 0;
      const shippingCharge = subtotal - discount >= env.freeShippingThreshold ? 0 : env.shippingCharge;
      [order] = await Order.create([{
        orderId: createOrderId(), user: req.user._id, items, subtotal, discount, shippingCharge,
        totalAmount: subtotal - discount + shippingCharge, couponCode: coupon?.code,
        paymentMethod: req.body.paymentMethod, shippingAddress: req.body.shippingAddress,
        orderStatus: 'PENDING',
        tracking: [{ status: 'PENDING', description: 'Awaiting payment' }],
      }], { session });
      if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } }, { session });
      await Cart.updateOne({ _id: cart._id }, { items: [], coupon: null }, { session });
    });
  } finally {
    await session.endSession();
  }
  req.log.info({
    orderId: order.orderId,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
  }, 'Order created');
  res.status(201).json({ success: true, order });
});

const listOrders = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'orders.list' }, 'Controller invoked');
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ success: true, orders });
});
const getOrder = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'orders.get', orderLookup: req.params.id }, 'Controller invoked');
  const filter = { $or: [{ orderId: req.params.id }, ...(mongoose.isValidObjectId(req.params.id) ? [{ _id: req.params.id }] : [])] };
  if (req.user.role !== 'admin') filter.user = req.user._id;
  const order = await Order.findOne(filter);
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});
const publicTracking = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'orders.publicTracking', orderId: req.params.orderId }, 'Controller invoked');
  const order = await Order.findOne({ orderId: req.params.orderId, 'shippingAddress.phone': req.query.phone })
    .select('orderId paymentStatus orderStatus shippingStatus courier awbNumber estimatedDelivery tracking createdAt');
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, order });
});

module.exports = { createOrder, listOrders, getOrder, publicTracking, dispatchShipment };
