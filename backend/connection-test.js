/**
 * MongoDB Connection String Tester
 * Tests different connection string formats to find one that works
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get the original MongoDB URI
const originalUri = process.env.MONGODB_URI || '';
console.log('Original connection string:', originalUri);

// Create alternative connection strings
let uri1, uri2, uri3;

// Parse the original URI to extract components
if (originalUri.includes('@')) {
  const [prefix, suffix] = originalUri.split('@');
  const [protocol, auth] = prefix.split('://');
  const [hostAndParams] = suffix.split('/');
  const [host] = hostAndParams.split('?');
  
  // Extract username and password
  const [username, password] = auth.split(':');
  
  // Extract database name
  const dbName = suffix.includes('/') ? suffix.split('/')[1].split('?')[0] : 'agriconnect';
  
  // Format 1: Standard connection without SRV
  uri1 = `mongodb://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
  
  // Format 2: With SRV but explicit servers
  const parts = host.split('.');
  if (parts.length >= 3) {
    // Replace first component with the shard info
    uri2 = `mongodb://${username}:${password}@ac-19awu94-shard-00-00.${parts.slice(1).join('.')},ac-19awu94-shard-00-01.${parts.slice(1).join('.')},ac-19awu94-shard-00-02.${parts.slice(1).join('.')}/${dbName}?ssl=true&replicaSet=atlas-nqpb2m-shard-0&authSource=admin&retryWrites=true&w=majority`;
  }
  
  // Format 3: Direct connection to primary shard
  uri3 = `mongodb://${username}:${password}@ac-19awu94-shard-00-00.${parts.slice(1).join('.')}:27017,ac-19awu94-shard-00-01.${parts.slice(1).join('.')}:27017,ac-19awu94-shard-00-02.${parts.slice(1).join('.')}:27017/${dbName}?ssl=true&replicaSet=atlas-nqpb2m-shard-0&authSource=admin&retryWrites=true&w=majority`;
}

// Test each connection string
async function testConnection(uri, label) {
  console.log(`\nTesting ${label}...`);
  console.log(uri.replace(/:[^:\/]+@/, ':******@'));
  
  try {
    await mongoose.connect(uri);
    console.log(`✅ Connection successful with ${label}!`);
    
    // Try a simple operation
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log('✅ Database operation successful!');
    
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error(`❌ Connection failed with ${label}:`, error.message);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    return false;
  }
}

// Main function
async function main() {
  console.log('Testing MongoDB connection strings...\n');
  
  // Test the original connection string
  const originalResult = await testConnection(originalUri, 'original connection string');
  
  // Test alternative connection strings if original fails
  if (!originalResult && uri1) {
    const result1 = await testConnection(uri1, 'alternative format 1');
    
    if (!result1 && uri2) {
      const result2 = await testConnection(uri2, 'alternative format 2');
      
      if (!result2 && uri3) {
        await testConnection(uri3, 'alternative format 3');
      }
    }
  }
  
  console.log('\nConnection testing completed.');
  
  // Show successful connection string for .env update
  console.log('\nIf one of the connection formats worked, update your .env file with that connection string.');
  console.log('Remember to whitelist your IP address (154.161.50.82) in MongoDB Atlas Network Access settings.');
}

// Run the tests
main(); 