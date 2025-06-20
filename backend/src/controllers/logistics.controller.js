const Logistics = require('../models/logistics.model');
const Order = require('../models/order.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Register as logistics provider
exports.registerLogistics = catchAsync(async (req, res, next) => {
  // Check if user is already registered as a logistics provider
  const existingProvider = await Logistics.findOne({ provider: req.user._id });
  
  if (existingProvider) {
    return next(new AppError('You are already registered as a logistics provider', 400));
  }

  const logistics = await Logistics.create({
    provider: req.user._id,
    ...req.body
  });

  res.status(201).json({
    status: 'success',
    data: {
      logistics
    }
  });
});

// Update logistics profile
exports.updateLogistics = catchAsync(async (req, res, next) => {
  const logistics = await Logistics.findOne({ provider: req.user._id });

  if (!logistics) {
    return next(new AppError('Logistics profile not found', 404));
  }

  // Update the logistics profile
  const updatedLogistics = await Logistics.findByIdAndUpdate(
    logistics._id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      logistics: updatedLogistics
    }
  });
});

// Get available logistics providers
exports.getAvailableProviders = catchAsync(async (req, res, next) => {
  const {
    region,
    district,
    vehicleType,
    page = 1,
    limit = 10
  } = req.query;

  const query = {
    'availability.status': 'available',
    status: 'active'
  };

  if (region) {
    query['coverage.regions'] = region;
  }

  if (district) {
    query['coverage.districts.name'] = district;
  }

  if (vehicleType) {
    query['vehicle.type'] = vehicleType;
  }

  const skip = (page - 1) * limit;

  const providers = await Logistics.find(query)
    .sort({ averageRating: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('provider', 'firstName lastName phoneNumber');

  const total = await Logistics.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: providers.length,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      limit: Number(limit)
    },
    data: {
      providers
    }
  });
});

// Assign delivery to logistics provider
exports.assignDelivery = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { providerId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  const logistics = await Logistics.findOne({ provider: providerId });
  if (!logistics) {
    return next(new AppError('Logistics provider not found', 404));
  }

  if (!logistics.isAvailableForDelivery()) {
    return next(new AppError('Logistics provider is not available for delivery', 400));
  }

  // Add delivery to logistics provider's active deliveries
  logistics.activeDeliveries.push({
    order: order._id,
    status: 'assigned',
    pickupLocation: order.items[0].farmer.location, // Assuming single pickup point
    dropoffLocation: order.delivery.address
  });

  // Update order with logistics provider
  order.delivery.provider = providerId;
  order.delivery.status = 'assigned';
  order.timeline.push({
    status: 'delivery_assigned',
    note: `Delivery assigned to ${logistics.provider.firstName} ${logistics.provider.lastName}`,
    updatedBy: req.user._id
  });

  await Promise.all([logistics.save(), order.save()]);

  res.status(200).json({
    status: 'success',
    data: {
      order,
      logistics
    }
  });
});

// Update delivery status
exports.updateDeliveryStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status, location, note } = req.body;

  const logistics = await Logistics.findOne({ provider: req.user._id });
  if (!logistics) {
    return next(new AppError('Logistics provider not found', 404));
  }

  const delivery = logistics.activeDeliveries.find(
    d => d.order.toString() === orderId
  );
  if (!delivery) {
    return next(new AppError('Delivery not found', 404));
  }

  // Update delivery status
  delivery.status = status;
  delivery.timeline.push({
    status,
    location,
    note,
    timestamp: new Date()
  });

  // Update order delivery status
  const order = await Order.findById(orderId);
  order.delivery.status = status;
  if (status === 'delivered') {
    order.delivery.actualDeliveryDate = new Date();
    order.status = 'delivered';
  }
  order.timeline.push({
    status: `delivery_${status}`,
    note,
    updatedBy: req.user._id
  });

  await Promise.all([logistics.save(), order.save()]);

  res.status(200).json({
    status: 'success',
    data: {
      delivery,
      order
    }
  });
});

// Get logistics provider's active deliveries
exports.getActiveDeliveries = catchAsync(async (req, res, next) => {
  const logistics = await Logistics.findOne({ provider: req.user._id })
    .populate({
      path: 'activeDeliveries.order',
      select: 'items delivery status',
      populate: [
        {
          path: 'items.product',
          select: 'name images'
        },
        {
          path: 'buyer',
          select: 'firstName lastName phoneNumber'
        }
      ]
    });

  if (!logistics) {
    return next(new AppError('Logistics provider not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      deliveries: logistics.activeDeliveries
    }
  });
});

// Rate logistics provider
exports.rateProvider = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.buyer.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only rate providers for your own orders', 403));
  }

  const logistics = await Logistics.findOne({ provider: order.delivery.provider });
  if (!logistics) {
    return next(new AppError('Logistics provider not found', 404));
  }

  // Check if already rated
  const existingRating = logistics.ratings.find(
    r => r.order.toString() === orderId
  );
  if (existingRating) {
    return next(new AppError('You have already rated this delivery', 400));
  }

  logistics.ratings.push({
    order: orderId,
    rating,
    review
  });

  await logistics.save();

  res.status(200).json({
    status: 'success',
    data: {
      rating: {
        order: orderId,
        rating,
        review
      }
    }
  });
});

// Get logistics provider statistics
exports.getLogisticsStats = catchAsync(async (req, res, next) => {
  const logistics = await Logistics.findOne({ provider: req.user._id });
  
  if (!logistics) {
    return next(new AppError('Logistics provider not found', 404));
  }

  // Update performance metrics
  logistics.updatePerformanceMetrics();
  await logistics.save();

  res.status(200).json({
    status: 'success',
    data: {
      performance: logistics.performance,
      ratings: {
        average: logistics.averageRating,
        total: logistics.ratings.length
      },
      activeDeliveries: logistics.activeDeliveries.length
    }
  });
}); 