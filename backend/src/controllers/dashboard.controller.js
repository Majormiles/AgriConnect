const User = require('../models/user.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get user dashboard data
exports.getDashboardData = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Basic dashboard data for all users
  const dashboardData = {
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      language: user.language,
      role: user.role
    },
    preferences: user.dashboardPreferences,
    notifications: [], // To be implemented with a Notification model
    recentActivity: [] // To be implemented with an Activity model
  };

  // Add farmer-specific data if user is a farmer
  if (user.role === 'farmer' && user.farm) {
    dashboardData.farm = {
      details: user.farm,
      analytics: {
        totalCrops: user.farm.crops.length,
        upcomingHarvests: user.farm.crops.filter(crop => 
          crop.expectedHarvestDate && new Date(crop.expectedHarvestDate) > new Date()
        ),
        // Additional analytics to be implemented
      }
    };
  }

  res.status(200).json({
    status: 'success',
    data: dashboardData
  });
});

// Update user profile
exports.updateProfile = catchAsync(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'language'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (req.body[field]) {
      updateData[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update dashboard preferences
exports.updatePreferences = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { dashboardPreferences: req.body },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      preferences: user.dashboardPreferences
    }
  });
});

// Update farm profile (farmer only)
exports.updateFarmProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user || user.role !== 'farmer') {
    throw new AppError('Access denied. Farmer profile required.', 403);
  }

  user.farm = {
    ...user.farm.toObject(),
    ...req.body
  };

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      farm: user.farm
    }
  });
});

// Add new crop to farm
exports.addCrop = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user || user.role !== 'farmer') {
    throw new AppError('Access denied. Farmer profile required.', 403);
  }

  user.farm.crops.push(req.body);
  await user.save();

  res.status(201).json({
    status: 'success',
    data: {
      crop: user.farm.crops[user.farm.crops.length - 1]
    }
  });
});

// Update crop details
exports.updateCrop = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user || user.role !== 'farmer') {
    throw new AppError('Access denied. Farmer profile required.', 403);
  }

  const cropIndex = user.farm.crops.findIndex(crop => crop._id.toString() === req.params.cropId);
  
  if (cropIndex === -1) {
    throw new AppError('Crop not found', 404);
  }

  user.farm.crops[cropIndex] = {
    ...user.farm.crops[cropIndex].toObject(),
    ...req.body
  };

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      crop: user.farm.crops[cropIndex]
    }
  });
});

// Delete crop
exports.deleteCrop = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user || user.role !== 'farmer') {
    throw new AppError('Access denied. Farmer profile required.', 403);
  }

  user.farm.crops = user.farm.crops.filter(crop => 
    crop._id.toString() !== req.params.cropId
  );

  await user.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
}); 