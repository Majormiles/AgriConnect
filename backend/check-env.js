// Simple script to check if .env file is loaded correctly
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Check if .env file exists
const envPath = path.resolve(__dirname, '.env');
console.log(`Checking for .env file at: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

// Try to load environment variables
console.log('Attempting to load .env file...');
const result = dotenv.config();
if (result.error) {
  console.error('Error loading .env file:', result.error.message);
} else {
  console.log('.env file loaded successfully!');
}

// Display loaded environment variables
console.log('\n==== Environment Variables ====');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'Not set');
console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME || 'Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '[HIDDEN]' : 'Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'Not set');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : 'Not set');
console.log('================================'); 