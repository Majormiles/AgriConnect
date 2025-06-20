const express = require('express');
const marketController = require('../controllers/market.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

// Public routes - market data accessible to all
router.get('/prices', marketController.getMarketPrices);
router.get('/trends', marketController.getMarketTrends);
router.get('/overview', marketController.getMarketOverview);

// Ghana commodity data routes (external API integration)
router.get('/commodities', marketController.getCommodityPrices);
router.get('/commodities/:commodityName', marketController.getSingleCommodityPrice);
router.get('/enhanced-overview', marketController.getEnhancedMarketOverview);
router.get('/commodity-service/status', marketController.getCommodityServiceStatus);

// Protected routes - require authentication
router.use(authMiddleware.protect);

// Market price management (admin and farmers only)
router.post('/prices', 
  authMiddleware.restrictTo('admin', 'farmer'), 
  marketController.createMarketPrice
);

// Market alerts (authenticated users)
router.route('/alerts')
  .get(marketController.getUserAlerts)
  .post(marketController.createMarketAlert);

router.route('/alerts/:id')
  .patch(marketController.updateMarketAlert)
  .delete(marketController.deleteMarketAlert);

// Admin-only commodity cache management
router.post('/commodity-service/clear-cache', 
  authMiddleware.restrictTo('admin'), 
  marketController.clearCommodityCache
);

module.exports = router; 