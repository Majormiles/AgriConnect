const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, delivery, paymentDetails } = req.body;

  // Validate products and calculate total
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new AppError(`Product not found with ID: ${item.product}`, 404));
    }

    if (!product.isAvailable()) {
      return next(new AppError(`Product ${product.name} is not available`, 400));
    }

    if (item.quantity.value > product.quantity.value) {
      return next(new AppError(`Insufficient quantity for product ${product.name}`, 400));
    }

    const subtotal = item.quantity.value * product.price.value;
    
    orderItems.push({
      product: product._id,
      farmer: product.farmer,
      quantity: item.quantity,
      pricePerUnit: product.price.value,
      subtotal
    });

    totalAmount += subtotal;
  }

  // Create the order
  const order = await Order.create({
    buyer: req.user._id,
    items: orderItems,
    totalAmount,
    delivery,
    paymentDetails
  });

  // Update product quantities
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { 'quantity.value': -item.quantity.value }
    });
  }

  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Get all orders (with filters)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const {
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  // Filter by user role
  if (req.user.role === 'farmer') {
    query['items.farmer'] = req.user._id;
  } else {
    query.buyer = req.user._id;
  }

  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('items.product', 'name images')
    .populate('items.farmer', 'firstName lastName businessProfile.businessName')
    .populate('buyer', 'firstName lastName');

  const total = await Order.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      limit: Number(limit)
    },
    data: {
      orders
    }
  });
});

// Get a single order
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images price quantity')
    .populate('items.farmer', 'firstName lastName businessProfile.businessName')
    .populate('buyer', 'firstName lastName phoneNumber')
    .populate('delivery.provider', 'firstName lastName phoneNumber');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check if user has access to this order
  const hasAccess = 
    order.buyer._id.toString() === req.user._id.toString() ||
    order.items.some(item => item.farmer._id.toString() === req.user._id.toString()) ||
    req.user.role === 'admin';

  if (!hasAccess) {
    return next(new AppError('You do not have permission to view this order', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Update order status
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Check permissions based on the requested status change
  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isFarmer = order.items.some(item => 
    item.farmer.toString() === req.user._id.toString()
  );

  if (!isBuyer && !isFarmer && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this order', 403));
  }

  // Validate status transitions
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['ready_for_pickup', 'cancelled'],
    ready_for_pickup: ['in_transit'],
    in_transit: ['delivered'],
    delivered: ['completed', 'disputed'],
    disputed: ['completed', 'cancelled']
  };

  if (!validTransitions[order.status].includes(status)) {
    return next(new AppError(`Invalid status transition from ${order.status} to ${status}`, 400));
  }

  // Update order status
  order.status = status;
  order.timeline.push({
    status,
    note,
    updatedBy: req.user._id
  });

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Cancel order
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (!order.canBeCancelled()) {
    return next(new AppError('This order cannot be cancelled', 400));
  }

  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isFarmer = order.items.some(item => 
    item.farmer.toString() === req.user._id.toString()
  );

  if (!isBuyer && !isFarmer && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to cancel this order', 403));
  }

  // Update order status
  order.status = 'cancelled';
  order.timeline.push({
    status: 'cancelled',
    note: req.body.note || 'Order cancelled',
    updatedBy: req.user._id
  });

  // Restore product quantities
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { 'quantity.value': item.quantity.value }
    });
  }

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Report order issue (create dispute)
exports.reportOrderIssue = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isFarmer = order.items.some(item => 
    item.farmer.toString() === req.user._id.toString()
  );

  if (!isBuyer && !isFarmer) {
    return next(new AppError('You do not have permission to report issues for this order', 403));
  }

  order.dispute = {
    isDisputed: true,
    reason,
    status: 'open',
    openedAt: new Date()
  };

  order.status = 'disputed';
  order.timeline.push({
    status: 'disputed',
    note: reason,
    updatedBy: req.user._id
  });

  await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Get order statistics
exports.getOrderStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};

  if (req.user.role === 'farmer') {
    matchStage['items.farmer'] = req.user._id;
  } else {
    matchStage.buyer = req.user._id;
  }

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const stats = await Order.aggregate([
    {
      $match: matchStage
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
}); 