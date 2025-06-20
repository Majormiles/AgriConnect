const Admin = require('../models/admin.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const jwt = require('jsonwebtoken');

// Utility function to catch async errors
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Generate JWT token for admin
const generateToken = (adminId) => {
  return jwt.sign({ adminId, type: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Admin login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const admin = await Admin.findOne({ email, isActive: true });
  if (!admin) {
    return next(new AppError('Invalid credentials', 401));
  }

  try {
    await admin.comparePassword(password);
  } catch (error) {
    return next(new AppError(error.message, 401));
  }

  const token = generateToken(admin._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }
    }
  });
});

// Admin logout
exports.logout = catchAsync(async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// Get admin profile
exports.getProfile = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-password');

  res.status(200).json({
    status: 'success',
    data: { admin }
  });
});

// Update admin profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, profile } = req.body;
  
  const admin = await Admin.findByIdAndUpdate(
    req.admin.id,
    { firstName, lastName, profile },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    data: { admin }
  });
});

// Dashboard statistics
exports.getDashboardStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalFarmers,
    totalBuyers,
    pendingFarmers,
    totalProducts,
    pendingProducts,
    totalOrders,
    pendingOrders,
    completedOrders,
    totalRevenue
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'farmer' }),
    User.countDocuments({ role: 'buyer' }),
    User.countDocuments({ role: 'farmer', 'verification.status': 'pending' }),
    Product.countDocuments(),
    Product.countDocuments({ status: 'pending' }),
    Order.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'completed' }),
    Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])
  ]);

  // Recent activities
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firstName lastName email role createdAt verification');

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('buyer', 'firstName lastName')
    .populate('farmer', 'firstName lastName')
    .select('orderNumber status totalAmount createdAt');

  const recentProducts = await Product.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('farmer', 'firstName lastName')
    .select('name status price createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        users: {
          total: totalUsers,
          farmers: totalFarmers,
          buyers: totalBuyers,
          pendingVerification: pendingFarmers
        },
        products: {
          total: totalProducts,
          pending: pendingProducts
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          completed: completedOrders
        },
        revenue: {
          total: totalRevenue[0]?.total || 0
        }
      },
      recentActivities: {
        users: recentUsers,
        orders: recentOrders,
        products: recentProducts
      }
    }
  });
});

// User management
exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, status, search } = req.query;
  
  const filter = {};
  if (role) filter.role = role;
  if (status) filter['verification.status'] = status;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-password');

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// Get user details
exports.getUserDetails = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Get user's products if farmer
  let products = [];
  if (user.role === 'farmer') {
    products = await Product.find({ farmer: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
  }

  // Get user's orders
  const orders = await Order.find({
    $or: [{ buyer: user._id }, { farmer: user._id }]
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('buyer farmer', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    data: {
      user,
      products,
      orders
    }
  });
});

// Approve/Reject farmer verification
exports.updateUserVerification = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError('Invalid verification status', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.verification.status = status;
  user.verification.verifiedAt = status === 'approved' ? new Date() : null;
  user.verification.verifiedBy = req.admin.id;
  user.verification.notes = notes;

  await user.save();

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Activate/Deactivate user
exports.toggleUserStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Product management
exports.getAllProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, category, search } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(filter)
    .populate('farmer', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// Approve/Reject product
exports.updateProductStatus = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;
  
  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    return next(new AppError('Invalid product status', 400));
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  product.status = status;
  product.moderationNotes = notes;
  product.moderatedBy = req.admin.id;
  product.moderatedAt = new Date();

  await product.save();

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

// Order management
exports.getAllOrders = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  
  const filter = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .populate('buyer farmer', 'firstName lastName email')
    .populate('products.product', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// Analytics data
exports.getAnalytics = catchAsync(async (req, res) => {
  const { timeframe = '30d' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (timeframe) {
    case '7d':
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
      break;
    case '30d':
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 30)) };
      break;
    case '90d':
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 90)) };
      break;
  }

  const [userGrowth, orderTrends, revenueData, categoryStats] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Order.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Order.aggregate([
      { $match: { status: 'completed', createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price.value' }
        }
      },
      { $sort: { count: -1 } }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      userGrowth,
      orderTrends,
      revenueData,
      categoryStats
    }
  });
}); 