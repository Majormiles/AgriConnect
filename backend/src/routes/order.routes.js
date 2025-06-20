const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// All routes are protected
router.use(authMiddleware.protect);

// Order creation and listing
router.route('/')
  .post(orderController.createOrder)
  .get(orderController.getAllOrders);

// Order statistics
router.get('/stats', orderController.getOrderStats);

// Order specific operations
router.route('/:id')
  .get(orderController.getOrder)
  .patch(orderController.updateOrderStatus);

// Order actions
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/report-issue', orderController.reportOrderIssue);

module.exports = router; 