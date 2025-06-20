/**
 * MongoDB Connection String Fixer
 * Creates a direct connection string to bypass DNS resolution issues
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config();

const envPath = path.join(__dirname, '.env');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to update .env file with new connection string
function updateEnvFile(newUri) {
  try {
    let envContent = '';
    
    console.log('Checking for .env file at:', envPath);
    // Read existing .env file
    if (fs.existsSync(envPath)) {
      console.log('.env file found, reading content');
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace MONGODB_URI line
      if (envContent.includes('MONGODB_URI=')) {
        console.log('Found existing MONGODB_URI, replacing it');
        envContent = envContent.replace(
          /MONGODB_URI=.*(\r?\n|$)/,
          `MONGODB_URI=${newUri}\n`
        );
      } else {
        console.log('No MONGODB_URI found, adding it to the beginning');
        envContent = `MONGODB_URI=${newUri}\n` + envContent;
      }
    } else {
      console.log('.env file not found, creating a new one');
      // Create new .env file with MongoDB URI
      envContent = `# MongoDB Connection
MONGODB_URI=${newUri}

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
    }
    
    // Write updated content back to .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    return false;
  }
}

// Main function
function main() {
  // Get the current connection string
  const currentUri = process.env.MONGODB_URI || '';
  
  console.log('Current MongoDB URI:', currentUri.replace(/:[^:\/]+@/, ':******@'));
  console.log('\nThis script will create a direct connection string to fix DNS resolution issues.');
  
  if (!currentUri || !currentUri.includes('@')) {
    console.error('❌ Invalid MongoDB URI format in .env file');
    console.log('Please enter your MongoDB URI (e.g., mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname):');
    rl.question('MongoDB URI: ', (uri) => {
      if (uri && uri.includes('@')) {
        console.log('Processing provided URI...');
        processUri(uri);
      } else {
        console.error('❌ Invalid URI format provided');
        rl.close();
      }
    });
    return;
  }
  
  processUri(currentUri);
}

function processUri(currentUri) {
  // Parse the current URI
  console.log('Parsing URI components...');
  const [prefix, suffix] = currentUri.split('@');
  console.log('Prefix:', prefix.replace(/:[^:\/]+/, ':******'));
  console.log('Suffix:', suffix);
  
  const protocol = prefix.split('://')[0];
  const auth = prefix.split('://')[1];
  console.log('Protocol:', protocol);
  console.log('Auth part:', auth.replace(/:[^:\/]+/, ':******'));
  
  const hostAndParams = suffix.split('/')[0];
  console.log('Host and params:', hostAndParams);
  
  // Extract username, password, and database
  const [username, password] = auth.split(':');
  console.log('Username:', username);
  
  const dbName = suffix.includes('/') ? suffix.split('/')[1].split('?')[0] : 'agriconnect';
  console.log('Database name:', dbName);
  
  // Create direct connection string with shard addresses
  const parts = hostAndParams.split('.');
  console.log('Host parts:', parts);
  const domain = parts.slice(1).join('.');
  console.log('Domain:', domain);
  
  const directUri = `mongodb://${username}:${password}@ac-19awu94-shard-00-00.${domain}:27017,ac-19awu94-shard-00-01.${domain}:27017,ac-19awu94-shard-00-02.${domain}:27017/${dbName}?ssl=true&replicaSet=atlas-nqpb2m-shard-0&authSource=admin&retryWrites=true&w=majority`;
  
  console.log('\nProposed new connection string:');
  console.log(directUri.replace(/:[^:\/]+@/, ':******@'));
  
  // Ask for confirmation
  rl.question('\nDo you want to update your .env file with this connection string? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      updateEnvFile(directUri);
      console.log('\n🔍 Next steps:');
      console.log('1. Make sure your IP address is whitelisted in MongoDB Atlas');
      console.log('2. Restart your server');
      console.log('3. If it still doesn\'t work, try using "admin" as the username instead of "setugah"');
    } else {
      console.log('No changes made to .env file.');
    }
    rl.close();
  });
}

// Run the main function
main(); 