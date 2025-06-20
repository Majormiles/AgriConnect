const fs = require('fs');
const path = require('path');

// Define the .env content
const envContent = `PORT=5001
MONGODB_URI=mongodb+srv://admin:Almighty1995@cluster0.gpmz9sr.mongodb.net/agriconnect?retryWrites=true&w=majority
NODE_ENV=development
JWT_SECRET=agriConnect_jwt_secret_key_2023
JWT_REFRESH_SECRET=agriConnect_jwt_refresh_secret_key_2023
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=setugahisrael@gmail.com
EMAIL_PASSWORD=qvrltyoheafluspc
EMAIL_FROM=agriconnect@gmail.com
FRONTEND_URL=http://localhost:3000`;

// Write to .env file
fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log('.env file created successfully!');
console.log('Path:', path.resolve(__dirname, '.env')); 