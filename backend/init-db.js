/**
 * This script initializes the database with test data
 * Run this script with: node init-db.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import models
const User = require('./src/models/user.model');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Create a test user
async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      return existingUser;
    }
    
    // Create a new test user
    const testUser = new User({
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User',
      isEmailVerified: true
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    return testUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    return null;
  }
}

// Display all collections in the database
async function listCollections() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nDatabase collections:');
    
    if (collections.length === 0) {
      console.log('No collections found');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
  } catch (error) {
    console.error('Error listing collections:', error);
  }
}

// Main function
async function initDB() {
  // Connect to MongoDB
  const connected = await connectDB();
  if (!connected) {
    console.error('Failed to connect to MongoDB. Make sure:');
    console.error('1. Your IP address is whitelisted in MongoDB Atlas');
    console.error('2. Your connection string in .env file is correct');
    process.exit(1);
  }
  
  // Create test user
  await createTestUser();
  
  // List collections
  await listCollections();
  
  // Close the connection
  await mongoose.disconnect();
  console.log('MongoDB connection closed');
  process.exit(0);
}

// Run the initialization
initDB(); 