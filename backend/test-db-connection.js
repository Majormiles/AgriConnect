const mongoose = require('mongoose');

// Original connection string components 
const username = 'setugah';
const password = encodeURIComponent('Almighty1995');
const cluster = 'cluster0.hg9rnwh.mongodb.net';
const dbName = 'agriconnect';

// Build the connection string with encoded password
const MONGODB_URI = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority`;

console.log('Attempting to connect with URI:', MONGODB_URI.replace(password, '********'));
console.log('Connection issues could be due to:');
console.log('1. Invalid username/password');
console.log('2. IP address not whitelisted in MongoDB Atlas');
console.log('3. Database user lacks proper permissions');

// Connect to MongoDB with updated options and more detailed error handling
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('Database connected:', dbName);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    
    if (err.code === 8000 && err.codeName === 'AtlasError') {
      console.error('\nAuthentication failed. Please check:');
      console.error('- Username and password are correct');
      console.error('- The user has appropriate permissions');
      console.error('- The user is associated with the correct database');
    }
    
    if (err.code === 'ENOTFOUND') {
      console.error('\nCould not reach the MongoDB server. Please check:');
      console.error('- Your internet connection');
      console.error('- The cluster name is correct');
    }
    
    process.exit(1);
  }); 