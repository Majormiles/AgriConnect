const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables with absolute path
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
console.log('File exists:', fs.existsSync(envPath));

// Force load .env file
try {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
  console.log('Successfully loaded .env file manually');
} catch (err) {
  console.error('Error loading .env file manually:', err.message);
}

// Verify required environment variables are set
console.log('==== Environment Configuration ====');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE ? 'Set' : 'Not set');
console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME ? 'Set' : 'Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? 'Set' : 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? 'Set' : 'Not set');
console.log('================================');

// Import routes
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const logisticsRoutes = require('./routes/logistics.routes');
const marketRoutes = require('./routes/market.routes');
const adminRoutes = require('./routes/admin.routes');

// Initialize Express app
const app = express();

// Middleware setup
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Set JWT secrets (fallbacks if .env is not used)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'agriconnect_secure_secret_key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'agriconnect_refresh_secure_secret_key';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:Almighty1995@cluster0.gpmz9sr.mongodb.net/agriconnect?retryWrites=true&w=majority';

// Improved MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // More detailed error messages based on error type
    if (error.name === 'MongoServerError' && error.code === 8000) {
      console.error('Authentication failed. Please check your MongoDB username and password.');
      console.error('Make sure the user exists and has the correct permissions.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('Network error. Please check your internet connection and MongoDB Atlas Network Access settings.');
      console.error('Make sure your IP address is whitelisted in MongoDB Atlas.');
    }
    
    return false;
  }
};

// Connect to MongoDB
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to AgriConnect API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      products: '/api/products',
      orders: '/api/orders',
      logistics: '/api/logistics',
      market: '/api/market',
      admin: '/api/admin'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  
  // Special handling for MongoDB connection errors
  if (err.name === 'MongooseError' || err.name === 'MongoServerError') {
    return res.status(503).json({
      message: 'Database connection error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
  
  res.status(statusCode).json({ 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Set port and start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('API Documentation:');
  console.log('- Auth: /api/auth');
  console.log('- Dashboard: /api/dashboard');
  console.log('- Products: /api/products');
  console.log('- Orders: /api/orders');
  console.log('- Logistics: /api/logistics');
  console.log('- Market: /api/market');
  console.log('- Admin: /api/admin');
});

module.exports = app; 