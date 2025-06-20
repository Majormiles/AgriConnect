const express = require('express');
const adminController = require('../controllers/admin.controller');
const adminMiddleware = require('../middleware/admin.middleware');

const router = express.Router();

// Public routes
router.post('/login', adminController.login);

// Protected routes - require admin authentication
router.use(adminMiddleware.protect);

// Admin profile management
router.get('/profile', adminController.getProfile);
router.patch('/profile', adminController.updateProfile);
router.post('/logout', adminController.logout);

// Dashboard and analytics
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/analytics', adminMiddleware.requirePermission('analytics', 'read'), adminController.getAnalytics);

// User management
router.get('/users', adminMiddleware.requirePermission('users', 'read'), adminController.getAllUsers);
router.get('/users/:id', adminMiddleware.requirePermission('users', 'read'), adminController.getUserDetails);
router.patch('/users/:id/verification', 
  adminMiddleware.requirePermission('users', 'approve'),
  adminMiddleware.auditLog('user_verification'),
  adminController.updateUserVerification
);
router.patch('/users/:id/status', 
  adminMiddleware.requirePermission('users', 'write'),
  adminMiddleware.auditLog('user_status_change'),
  adminController.toggleUserStatus
);

// Product management
router.get('/products', adminMiddleware.requirePermission('products', 'read'), adminController.getAllProducts);
router.patch('/products/:id/status', 
  adminMiddleware.requirePermission('products', 'approve'),
  adminMiddleware.auditLog('product_moderation'),
  adminController.updateProductStatus
);

// Order management
router.get('/orders', adminMiddleware.requirePermission('orders', 'read'), adminController.getAllOrders);

module.exports = router; 