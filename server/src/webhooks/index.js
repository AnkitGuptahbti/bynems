const express = require('express');
const { Order, Payment, Shipment } = require('../models');
const { ApiError, asyncHandler } = require('../utils');
const razorpay = require('../services/razorpay.service');
const nimbuspost = require('../services/nimbuspost.service');

const router = express.Router();
router.use(express.raw({ type: 'application/json', limit: '1mb' }));

router.post('/razorpay', asyncHandler(async (req, res) => {
  if (!razorpay.verifyWebhookSignature(req.body, req.headers['x-razorpay-signature'])) throw new ApiError(401, 'Invalid webhook signature');
  const event = JSON.parse(req.body.toString('utf8'));
  const entity = event.payload?.payment?.entity;
  req.log.info({
    provider: 'razorpay',
    event: event.event,
    providerPaymentId: entity?.id,
    providerOrderId: entity?.order_id,
  }, 'Payment webhook received');
  if (entity && ['payment.captured', 'payment.failed'].includes(event.event)) {
    const paid = event.event === 'payment.captured';
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: entity.order_id },
      { paymentStatus: paid ? 'PAID' : 'FAILED', ...(paid && { orderStatus: 'CONFIRMED', razorpayPaymentId: entity.id }) },
      { new: true }
    );
    if (order) {
      await Payment.findOneAndUpdate({ order: order._id }, { status: paid ? 'captured' : 'failed', providerPaymentId: entity.id, raw: entity });
      req.log.info({ orderId: order.orderId, paymentStatus: order.paymentStatus }, 'Payment status updated from webhook');
    } else {
      req.log.warn({ providerOrderId: entity.order_id }, 'Payment webhook did not match an order');
    }
  }
  res.json({ received: true });
}));

router.post('/nimbuspost', asyncHandler(async (req, res) => {
  if (!nimbuspost.verifyWebhook(req.body, req.headers['x-nimbuspost-signature'])) throw new ApiError(401, 'Invalid webhook signature');
  const event = JSON.parse(req.body.toString('utf8'));
  const data = event.data || event;
  const awbNumber = data.awb_number || data.awb;
  const status = data.status || data.current_status;
  req.log.info({ provider: 'nimbuspost', awbNumber, shipmentStatus: status }, 'Shipment webhook received');
  const trackingEvent = { status, description: data.description || status, location: data.location, occurredAt: data.timestamp || new Date() };
  const shipment = await Shipment.findOneAndUpdate(
    { awbNumber },
    { status, $push: { tracking: trackingEvent }, raw: data },
    { new: true }
  );
  if (shipment) {
    const orderStatusMap = { delivered: 'DELIVERED', shipped: 'SHIPPED', packed: 'PACKED' };
    await Order.findByIdAndUpdate(shipment.order, {
      shippingStatus: status,
      ...(orderStatusMap[String(status).toLowerCase()] && { orderStatus: orderStatusMap[String(status).toLowerCase()] }),
      $push: { tracking: trackingEvent },
    });
  } else {
    req.log.warn({ awbNumber }, 'Shipment webhook did not match a shipment');
  }
  res.json({ received: true });
}));

module.exports = router;
