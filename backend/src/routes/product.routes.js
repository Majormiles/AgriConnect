const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes
router.use(authMiddleware.protect);

// Farmer only routes
router.use(authMiddleware.restrictTo('farmer'));
router.post('/', productController.createProduct);
router.get('/farmer/stats', productController.getProductStats);
router.get('/farmer/products', productController.getFarmerProducts);

// Product specific routes (farmer only)
router.route('/:id')
  .patch(authMiddleware.restrictTo('farmer'), productController.updateProduct)
  .delete(authMiddleware.restrictTo('farmer'), productController.deleteProduct);

// Rating routes (any authenticated user)
router.post('/:id/ratings', productController.addProductRating);

module.exports = router; 