const fs = require('fs');
const path = require('path');

/**
 * This script will help you fix your MongoDB connection issue
 * Run this script with: node fix-mongodb.js
 */

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found. Creating one...');
  
  // Create .env file with template
  const envContent = `# MongoDB Connection
MONGODB_URI=mongodb+srv://setugah:Almighty1995@cluster0.hg9rnwh.mongodb.net/agriconnect?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=mysecretjwtkey9876543210
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=refreshsecretkey1234567890
JWT_REFRESH_EXPIRE=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@agriconnect.com
FRONTEND_URL=http://localhost:3000`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully.');
} else {
  console.log('✅ .env file exists.');
}

console.log('\n📝 Steps to fix your MongoDB connection issue:');
console.log('1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
console.log('2. Check if your user "setugah" exists and has the correct password');
console.log('3. If the user exists, reset the password');
console.log('4. Make sure the user has appropriate database access permissions (at least readWrite)');
console.log('5. Ensure your IP address is whitelisted in Network Access');
console.log('6. Update your .env file with the new credentials if needed');

console.log('\n🔑 To create a new database user:');
console.log('1. In MongoDB Atlas, go to Database Access');
console.log('2. Click "+ ADD NEW DATABASE USER"');
console.log('3. Choose Password authentication method');
console.log('4. Enter a new username and password');
console.log('5. Set privileges to "Read and write to any database"');
console.log('6. Click "Add User"');
console.log('7. Update your .env file with the new user credentials');

console.log('\n🔒 To whitelist your IP address:');
console.log('1. In MongoDB Atlas, go to Network Access');
console.log('2. Click "+ ADD IP ADDRESS"');
console.log('3. Click "ALLOW ACCESS FROM ANYWHERE" for testing or enter your specific IP');
console.log('4. Click "Confirm"');

console.log('\n🧪 To test your connection after making changes:');
console.log('Run: node test-db-connection.js');

console.log('\n❓ If you still have issues:');
console.log('- Verify the cluster name in your connection string');
console.log('- Check if MongoDB Atlas is having service issues');
console.log('- Try using MongoDB Compass to test the connection string'); 