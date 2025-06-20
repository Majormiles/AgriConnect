// Simple dotenv test
require('dotenv').config();
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL); 