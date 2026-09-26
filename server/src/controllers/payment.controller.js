const { Order, Payment } = require('../models');
const { ApiError, asyncHandler } = require('../utils');
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

module.exports = { createPayment, verifyPayment };
