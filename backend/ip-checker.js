/**
 * IP Checker and MongoDB Connection Troubleshooter
 * This script helps identify your current IP address and tests MongoDB connection
 */
const https = require('https');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}==================================================${colors.reset}`);
console.log(`${colors.cyan}  IP Address Checker & MongoDB Connection Tester${colors.reset}`);
console.log(`${colors.cyan}==================================================${colors.reset}\n`);

// Get current MongoDB URI from .env
let mongoUri = process.env.MONGODB_URI || '';
if (!mongoUri) {
  console.log(`${colors.red}No MongoDB URI found in .env file${colors.reset}`);
  process.exit(1);
}

// Function to get current public IP address
async function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data.trim());
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Test MongoDB connection
async function testMongoConnection() {
  try {
    await mongoose.connect(mongoUri);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(`${colors.green}✅ MongoDB connection successful!${colors.reset}`);
    
    // Get database name from connection string
    const dbName = mongoose.connection.db.databaseName;
    console.log(`${colors.green}Connected to database: ${dbName}${colors.reset}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`${colors.green}Collections in database:${colors.reset}`);
    if (collections.length === 0) {
      console.log(`${colors.yellow}No collections found${colors.reset}`);
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ MongoDB connection error:${colors.reset}`, error.message);
    
    if (error.message.includes('IP address')) {
      console.log(`\n${colors.yellow}This appears to be an IP whitelist issue.${colors.reset}`);
    }
    
    await mongoose.disconnect();
    return false;
  }
}

// Main function
async function main() {
  try {
    // Get public IP
    console.log(`${colors.yellow}Detecting your public IP address...${colors.reset}`);
    const publicIP = await getPublicIP();
    console.log(`${colors.green}Your public IP address is: ${publicIP}${colors.reset}`);
    
    // Instructions for whitelisting
    console.log(`\n${colors.magenta}To whitelist your IP in MongoDB Atlas:${colors.reset}`);
    console.log(`1. Log in to MongoDB Atlas at https://cloud.mongodb.com`);
    console.log(`2. Select your project/cluster`);
    console.log(`3. Click "Network Access" in the left sidebar`);
    console.log(`4. Click "ADD IP ADDRESS"`);
    console.log(`5. Enter your IP address: ${publicIP}`);
    console.log(`6. Click "Confirm"`);
    console.log(`7. Wait for the change to be applied (usually 1-2 minutes)`);
    
    // Also offer option to allow from anywhere
    console.log(`\n${colors.yellow}For testing purposes, you can also allow access from anywhere:${colors.reset}`);
    console.log(`1. Click "ADD IP ADDRESS"`);
    console.log(`2. Click "ALLOW ACCESS FROM ANYWHERE" (adds 0.0.0.0/0)`);
    console.log(`3. Click "Confirm"`);
    
    // Test MongoDB connection
    console.log(`\n${colors.yellow}Testing MongoDB connection...${colors.reset}`);
    await testMongoConnection();
    
    console.log(`\n${colors.blue}After whitelisting your IP, run your server again.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
  }
}

// Run the main function
main(); 