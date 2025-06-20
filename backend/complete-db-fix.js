const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

console.log(`${colors.cyan}====================================${colors.reset}`);
console.log(`${colors.cyan}  MongoDB Connection Fix Utility${colors.reset}`);
console.log(`${colors.cyan}====================================${colors.reset}\n`);

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Function to test MongoDB connection
async function testConnection(uri) {
  try {
    console.log(`${colors.yellow}Testing connection to MongoDB...${colors.reset}`);
    await mongoose.connect(uri);
    console.log(`${colors.green}✅ MongoDB connection successful!${colors.reset}`);
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ MongoDB connection error:${colors.reset}`, error.message);
    return false;
  }
}

// Function to update .env file
function updateEnvFile(mongoUri) {
  try {
    // Read current .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Replace MONGODB_URI line
      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(/MONGODB_URI=.*(\r?\n|$)/, `MONGODB_URI=${mongoUri}\n`);
      } else {
        envContent = `MONGODB_URI=${mongoUri}\n` + envContent;
      }
    } else {
      // Create new .env file with MongoDB URI
      envContent = `# MongoDB Connection
MONGODB_URI=${mongoUri}

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
    console.log(`${colors.green}✅ .env file updated successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error updating .env file:${colors.reset}`, error.message);
    return false;
  }
}

// Function to restart the server
function restartServer() {
  console.log(`${colors.yellow}Restarting server...${colors.reset}`);
  exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`${colors.red}❌ Error restarting server:${colors.reset}`, error.message);
      return;
    }
    console.log(stdout);
  });
}

// Main function
async function main() {
  // Current MongoDB URI
  let currentUri = 'mongodb+srv://setugah:Almighty1995@cluster0.hg9rnwh.mongodb.net/agriconnect?retryWrites=true&w=majority';
  
  // Try to read from existing .env file
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*?)(\r?\n|$)/);
    if (match && match[1]) {
      currentUri = match[1];
    }
  }
  
  console.log(`${colors.blue}Current MongoDB URI:${colors.reset} ${currentUri}`);
  
  // Prompt user for action
  console.log('\n');
  console.log(`${colors.magenta}Choose an option:${colors.reset}`);
  console.log(`1. Test current connection`);
  console.log(`2. Update MongoDB URI`);
  console.log(`3. Get troubleshooting steps`);
  console.log(`4. Exit`);
  
  rl.question(`\n${colors.yellow}Enter your choice (1-4):${colors.reset} `, async (choice) => {
    switch (choice) {
      case '1':
        // Test current connection
        await testConnection(currentUri);
        setTimeout(() => main(), 1000);
        break;
        
      case '2':
        // Update MongoDB URI
        rl.question(`\n${colors.yellow}Enter new MongoDB URI:${colors.reset} `, async (newUri) => {
          // Validate the URI
          if (!newUri.startsWith('mongodb')) {
            console.error(`${colors.red}❌ Invalid MongoDB URI format${colors.reset}`);
            setTimeout(() => main(), 1000);
            return;
          }
          
          // Test the new URI
          const success = await testConnection(newUri);
          if (success) {
            // Update .env file
            updateEnvFile(newUri);
            
            // Ask to restart server
            rl.question(`\n${colors.yellow}Do you want to restart the server? (y/n):${colors.reset} `, (answer) => {
              if (answer.toLowerCase() === 'y') {
                restartServer();
                rl.close();
              } else {
                setTimeout(() => main(), 1000);
              }
            });
          } else {
            setTimeout(() => main(), 1000);
          }
        });
        break;
        
      case '3':
        // Show troubleshooting steps
        console.log(`\n${colors.cyan}📝 MongoDB Connection Troubleshooting:${colors.reset}`);
        console.log(`1. Verify your MongoDB Atlas account at https://cloud.mongodb.com`);
        console.log(`2. Check that user "setugah" exists and has the correct password`);
        console.log(`3. Check that the user has appropriate database permissions (at least readWrite)`);
        console.log(`4. Ensure your IP address is whitelisted in Network Access`);
        console.log(`5. If using Atlas, verify the cluster name in your connection string`);
        console.log(`6. Create a new database user if needed:
   - Go to Database Access
   - Click "+ ADD NEW DATABASE USER"
   - Choose Password authentication method
   - Enter a new username and password
   - Set appropriate privileges`);
        
        setTimeout(() => main(), 3000);
        break;
        
      case '4':
        // Exit
        console.log(`${colors.green}Goodbye!${colors.reset}`);
        rl.close();
        break;
        
      default:
        console.log(`${colors.red}Invalid choice. Please try again.${colors.reset}`);
        setTimeout(() => main(), 1000);
    }
  });
}

// Start the program
main();

// Handle process exit
rl.on('close', () => {
  console.log(`${colors.blue}Thank you for using the MongoDB Connection Fix Utility!${colors.reset}`);
  process.exit(0);
}); 