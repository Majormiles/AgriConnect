const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

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

// Protect admin routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to access admin panel.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  if (decoded.type !== 'admin') {
    return next(new AppError('Invalid token type. Admin access required.', 401));
  }

  // 3) Check if admin still exists
  const admin = await Admin.findById(decoded.adminId);
  if (!admin) {
    return next(new AppError('The admin belonging to this token no longer exists.', 401));
  }

  // 4) Check if admin account is active
  if (!admin.isActive) {
    return next(new AppError('Your admin account has been deactivated.', 401));
  }

  // 5) Check if account is locked
  if (admin.isLocked) {
    return next(new AppError('Your admin account is temporarily locked.', 401));
  }

  // Grant access to protected route
  req.admin = admin;
  next();
});

// Restrict to specific admin roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Check specific permission
exports.requirePermission = (module, action) => {
  return (req, res, next) => {
    if (!req.admin.hasPermission(module, action)) {
      return next(new AppError(`You do not have ${action} permission for ${module}`, 403));
    }
    next();
  };
};

// Audit log middleware
exports.auditLog = (action) => {
  return (req, res, next) => {
    // Store audit information in request for later logging
    req.audit = {
      admin: req.admin._id,
      action,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    next();
  };
}; 