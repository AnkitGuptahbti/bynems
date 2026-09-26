const { Address, User } = require('../models');
const { ApiError, asyncHandler } = require('../utils');

const getProfile = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'users.profile.get' }, 'Controller invoked');
  res.json({ success: true, user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'users.profile.update' }, 'Controller invoked');
  const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, phone: req.body.phone }, { new: true, runValidators: true });
  res.json({ success: true, user });
});

const listAddresses = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'users.addresses.list' }, 'Controller invoked');
  res.json({ success: true, addresses: await Address.find({ user: req.user._id }).sort('-isDefault') });
});

const createAddress = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'users.addresses.create', label: req.body.label }, 'Controller invoked');
  if (req.body.isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, address });
});

const updateAddress = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'users.addresses.update', addressId: req.params.id }, 'Controller invoked');
  if (req.body.isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
  if (!address) throw new ApiError(404, 'Address not found');
  res.json({ success: true, address });
});

const deleteAddress = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'users.addresses.delete', addressId: req.params.id }, 'Controller invoked');
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw new ApiError(404, 'Address not found');
  res.json({ success: true, message: 'Address deleted' });
});

module.exports = { getProfile, updateProfile, listAddresses, createAddress, updateAddress, deleteAddress };
