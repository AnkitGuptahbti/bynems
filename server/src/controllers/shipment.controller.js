const { Order, Shipment } = require('../models');
const { ApiError, asyncHandler } = require('../utils');
const nimbuspost = require('../services/nimbuspost.service');
const { dispatchShipment } = require('./order.controller');

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

module.exports = { createShipment, getShipment, trackShipment };
