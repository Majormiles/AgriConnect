const express = require('express');
const logisticsController = require('../controllers/logistics.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// All routes are protected
router.use(authMiddleware.protect);

// Provider registration and profile
router.post('/register', logisticsController.registerLogistics);
router.patch('/profile', logisticsController.updateLogistics);

// Provider listing
router.get('/available', logisticsController.getAvailableProviders);

// Delivery management
router.post('/deliveries/:orderId/assign', logisticsController.assignDelivery);
router.patch('/deliveries/:orderId/status', logisticsController.updateDeliveryStatus);
router.get('/deliveries/active', logisticsController.getActiveDeliveries);

// Provider rating
router.post('/rate/:orderId', logisticsController.rateProvider);

// Provider statistics
router.get('/stats', logisticsController.getLogisticsStats);

module.exports = router; 