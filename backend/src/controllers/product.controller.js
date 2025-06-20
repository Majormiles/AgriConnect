const Product = require('../models/product.model');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new product
exports.createProduct = catchAsync(async (req, res, next) => {
  // Only farmers can create products
  if (req.user.role !== 'farmer') {
    return next(new AppError('Only farmers can create products', 403));
  }

  const product = await Product.create({
    ...req.body,
    farmer: req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Get all products with filters
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const {
    category,
    region,
    district,
    minPrice,
    maxPrice,
    availability,
    sortBy,
    page = 1,
    limit = 10
  } = req.query;

  // Build query
  const query = {};
  
  if (category) query.category = category;
  if (region) query['location.region'] = region;
  if (district) query['location.district'] = district;
  if (availability) query['availability.status'] = availability;
  
  if (minPrice || maxPrice) {
    query['price.value'] = {};
    if (minPrice) query['price.value'].$gte = Number(minPrice);
    if (maxPrice) query['price.value'].$lte = Number(maxPrice);
  }

  // Build sort options
  let sort = {};
  if (sortBy) {
    switch (sortBy) {
      case 'price_asc':
        sort = { 'price.value': 1 };
        break;
      case 'price_desc':
        sort = { 'price.value': -1 };
        break;
      case 'rating':
        sort = { averageRating: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate('farmer', 'firstName lastName businessProfile.businessName');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: products.length,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      limit: Number(limit)
    },
    data: {
      products
    }
  });
});

// Get a single product
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('farmer', 'firstName lastName businessProfile.businessName farm.farmName');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Increment views
  product.views += 1;
  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Update a product
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user is the farmer who created the product
  if (product.farmer.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only update your own products', 403));
  }

  // Update the product
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct
    }
  });
});

// Delete a product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user is the farmer who created the product
  if (product.farmer.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only delete your own products', 403));
  }

  await product.remove();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Add a product rating
exports.addProductRating = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if user has already rated this product
  const existingRating = product.ratings.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (existingRating) {
    return next(new AppError('You have already rated this product', 400));
  }

  product.ratings.push({
    user: req.user._id,
    rating,
    review
  });

  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Get farmer's products
exports.getFarmerProducts = catchAsync(async (req, res, next) => {
  const {
    status = 'published',
    page = 1,
    limit = 10
  } = req.query;

  const query = {
    farmer: req.user._id
  };

  if (status !== 'all') {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: products.length,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      limit: Number(limit)
    },
    data: {
      products
    }
  });
});

// Get product statistics
exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { farmer: req.user._id }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        averageRating: { $avg: '$averageRating' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
}); 