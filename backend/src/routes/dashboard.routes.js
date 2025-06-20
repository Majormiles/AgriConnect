const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');
const router = express.Router();

// Protect all dashboard routes
router.use(protect);

// Dashboard data
router.get('/', dashboardController.getDashboardData);

// Profile management
router.patch('/profile', dashboardController.updateProfile);
router.patch('/preferences', dashboardController.updatePreferences);

// Farm management (farmer only)
router.patch('/farm', dashboardController.updateFarmProfile);
router.post('/farm/crops', dashboardController.addCrop);
router.patch('/farm/crops/:cropId', dashboardController.updateCrop);
router.delete('/farm/crops/:cropId', dashboardController.deleteCrop);

module.exports = router; 