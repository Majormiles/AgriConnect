const { MarketPrice, MarketAlert } = require('../models/market.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const commodityService = require('../services/commodity.service');

// Get market prices with filters and aggregation
exports.getMarketPrices = catchAsync(async (req, res, next) => {
  const {
    product,
    category,
    region,
    district,
    timeframe = '7d',
    page = 1,
    limit = 20
  } = req.query;

  // Build query
  const query = {};
  if (product) query['product.name'] = new RegExp(product, 'i');
  if (category) query['product.category'] = category;
  if (region) query['location.region'] = region;
  if (district) query['location.district'] = district;

  // Calculate date range for timeframe
  const now = new Date();
  let startDate;
  switch (timeframe) {
    case '1d':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  query.createdAt = { $gte: startDate };

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const prices = await MarketPrice.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await MarketPrice.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: prices.length,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      limit: Number(limit)
    },
    data: {
      prices
    }
  });
});

// Get market trends for specific products
exports.getMarketTrends = catchAsync(async (req, res, next) => {
  const { product, region, timeframe = '30d' } = req.query;

  if (!product) {
    return next(new AppError('Product name is required', 400));
  }

  // Calculate date range
  const now = new Date();
  let startDate;
  let groupBy;
  
  switch (timeframe) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      groupBy = { $dateToString: { format: "%Y-%U", date: "$createdAt" } };
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }

  const matchStage = {
    'product.name': new RegExp(product, 'i'),
    createdAt: { $gte: startDate }
  };

  if (region) {
    matchStage['location.region'] = region;
  }

  const trends = await MarketPrice.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: groupBy,
        avgPrice: { $avg: '$price.current' },
        minPrice: { $min: '$price.current' },
        maxPrice: { $max: '$price.current' },
        totalSupply: { $sum: '$supply.available' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      trends,
      product,
      region: region || 'All Regions',
      timeframe
    }
  });
});

// Get market overview dashboard data
exports.getMarketOverview = catchAsync(async (req, res, next) => {
  const { region } = req.query;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const matchStage = region ? { 'location.region': region } : {};

  // Get latest prices by category
  const categoryPrices = await MarketPrice.aggregate([
    { $match: { ...matchStage, createdAt: { $gte: yesterday } } },
    {
      $group: {
        _id: '$product.category',
        avgPrice: { $avg: '$price.current' },
        products: { $addToSet: '$product.name' },
        totalSupply: { $sum: '$supply.available' }
      }
    },
    { $sort: { avgPrice: -1 } }
  ]);

  // Get top trending products
  const trendingProducts = await MarketPrice.aggregate([
    { $match: { ...matchStage, createdAt: { $gte: yesterday } } },
    {
      $group: {
        _id: '$product.name',
        currentPrice: { $avg: '$price.current' },
        priceChange: { $avg: '$trends.dailyChange.percentage' },
        supply: { $sum: '$supply.available' }
      }
    },
    { $sort: { priceChange: -1 } },
    { $limit: 10 }
  ]);

  // Get regional price comparisons
  const regionalComparison = await MarketPrice.aggregate([
    { $match: { createdAt: { $gte: yesterday } } },
    {
      $group: {
        _id: '$location.region',
        avgPrice: { $avg: '$price.current' },
        productCount: { $addToSet: '$product.name' },
        totalSupply: { $sum: '$supply.available' }
      }
    },
    {
      $project: {
        region: '$_id',
        avgPrice: 1,
        productVariety: { $size: '$productCount' },
        totalSupply: 1
      }
    },
    { $sort: { avgPrice: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      categoryPrices,
      trendingProducts,
      regionalComparison,
      region: region || 'All Regions',
      lastUpdated: now
    }
  });
});

// Create or update market price
exports.createMarketPrice = catchAsync(async (req, res, next) => {
  // Only admin or verified farmers can update market prices
  if (req.user.role !== 'admin' && req.user.role !== 'farmer') {
    return next(new AppError('Only admins and farmers can update market prices', 403));
  }

  const marketPrice = await MarketPrice.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      marketPrice
    }
  });
});

// Create market alert
exports.createMarketAlert = catchAsync(async (req, res, next) => {
  const alert = await MarketAlert.create({
    ...req.body,
    user: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: {
      alert
    }
  });
});

// Get user's market alerts
exports.getUserAlerts = catchAsync(async (req, res, next) => {
  const alerts = await MarketAlert.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: alerts.length,
    data: {
      alerts
    }
  });
});

// Update market alert
exports.updateMarketAlert = catchAsync(async (req, res, next) => {
  const alert = await MarketAlert.findById(req.params.id);

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  if (alert.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own alerts', 403));
  }

  const updatedAlert = await MarketAlert.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      alert: updatedAlert
    }
  });
});

// Delete market alert
exports.deleteMarketAlert = catchAsync(async (req, res, next) => {
  const alert = await MarketAlert.findById(req.params.id);

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  if (alert.user.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own alerts', 403));
  }

  await alert.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get Ghana commodity prices from external API (Free Tier)
exports.getCommodityPrices = catchAsync(async (req, res, next) => {
  const { region, forceRefresh = false, tier = 'free' } = req.query;
  
  try {
    let commodityData;
    if (tier === 'premium') {
      commodityData = await commodityService.getGhanaPremiumCommodities(region);
    } else {
      commodityData = await commodityService.getGhanaPrimaryCommodities(region);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        commodities: commodityData.results,
        errors: commodityData.errors,
        region: region || 'All Regions',
        tier: tier,
        lastUpdated: new Date(),
        dataSource: 'api_ninjas_integration',
        note: tier === 'premium' ? 'Premium commodities require paid API subscription' : 'Free tier commodities'
      }
    });
  } catch (error) {
    return next(new AppError(`Failed to fetch commodity prices: ${error.message}`, 500));
  }
});

// Get specific commodity price
exports.getSingleCommodityPrice = catchAsync(async (req, res, next) => {
  const { commodityName } = req.params;
  const { region, forceRefresh = false } = req.query;
  
  if (!commodityName) {
    return next(new AppError('Commodity name is required', 400));
  }
  
  try {
    const commodityData = await commodityService.getCommodityPrice(commodityName, {
      region,
      forceRefresh: forceRefresh === 'true'
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        commodity: commodityData,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    return next(new AppError(`Failed to fetch ${commodityName} price: ${error.message}`, 500));
  }
});

// Enhanced market overview with external commodity data
exports.getEnhancedMarketOverview = catchAsync(async (req, res, next) => {
  const { region } = req.query;
  
  try {
    // Get local market data (existing functionality)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const matchStage = region ? { 'location.region': region } : {};

    // Get local data in parallel with external commodity data
    const [localData, externalCommodities] = await Promise.all([
      // Local market data aggregation
      Promise.all([
        MarketPrice.aggregate([
          { $match: { ...matchStage, createdAt: { $gte: yesterday } } },
          {
            $group: {
              _id: '$product.category',
              avgPrice: { $avg: '$price.current' },
              products: { $addToSet: '$product.name' },
              totalSupply: { $sum: '$supply.available' }
            }
          },
          { $sort: { avgPrice: -1 } }
        ]),
        MarketPrice.aggregate([
          { $match: { ...matchStage, createdAt: { $gte: yesterday } } },
          {
            $group: {
              _id: '$product.name',
              currentPrice: { $avg: '$price.current' },
              priceChange: { $avg: '$trends.dailyChange.percentage' },
              supply: { $sum: '$supply.available' }
            }
          },
          { $sort: { priceChange: -1 } },
          { $limit: 10 }
        ]),
        MarketPrice.aggregate([
          { $match: { createdAt: { $gte: yesterday } } },
          {
            $group: {
              _id: '$location.region',
              avgPrice: { $avg: '$price.current' },
              productCount: { $addToSet: '$product.name' },
              totalSupply: { $sum: '$supply.available' }
            }
          },
          {
            $project: {
              region: '$_id',
              avgPrice: 1,
              productVariety: { $size: '$productCount' },
              totalSupply: 1
            }
          },
          { $sort: { avgPrice: 1 } }
        ])
      ]),
      // External commodity data
      commodityService.getGhanaPrimaryCommodities(region)
    ]);

    const [categoryPrices, trendingProducts, regionalComparison] = localData;

    // Process external commodity data for integration
    const externalCommoditiesProcessed = Object.entries(externalCommodities.results).map(([name, data]) => ({
      _id: name,
      currentPrice: data.marketInsights.finalPriceGHS,
      priceChange: null, // No historical data from external API
      supply: null,
      dataSource: 'external_api',
      unit: data.unit,
      lastUpdated: data.lastUpdated,
      priceUSD: data.priceUSD,
      exchangeRate: data.exchangeRate,
      isStale: data.isStale || false
    }));

    res.status(200).json({
      status: 'success',
      data: {
        categoryPrices,
        trendingProducts: [...trendingProducts, ...externalCommoditiesProcessed],
        regionalComparison,
        externalCommodities: externalCommodities.results,
        commodityErrors: externalCommodities.errors,
        region: region || 'All Regions',
        lastUpdated: now,
        dataIntegration: {
          localSources: trendingProducts.length,
          externalSources: Object.keys(externalCommodities.results).length,
          errors: Object.keys(externalCommodities.errors).length
        }
      }
    });
  } catch (error) {
    return next(new AppError(`Failed to fetch enhanced market overview: ${error.message}`, 500));
  }
});

// Commodity service health check
exports.getCommodityServiceStatus = catchAsync(async (req, res, next) => {
  try {
    const healthStatus = await commodityService.healthCheck();
    const cacheStats = commodityService.getCacheStats();
    
    res.status(200).json({
      status: 'success',
      data: {
        serviceHealth: healthStatus,
        cacheStatistics: cacheStats,
        timestamp: new Date()
      }
    });
  } catch (error) {
    return next(new AppError(`Commodity service health check failed: ${error.message}`, 500));
  }
});

// Clear commodity cache (admin only)
exports.clearCommodityCache = catchAsync(async (req, res, next) => {
  try {
    commodityService.clearCache();
    
    res.status(200).json({
      status: 'success',
      message: 'Commodity cache cleared successfully',
      timestamp: new Date()
    });
  } catch (error) {
    return next(new AppError(`Failed to clear cache: ${error.message}`, 500));
  }
}); 