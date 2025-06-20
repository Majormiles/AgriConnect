/**
 * Custom server starter that uses a different port
 * This can help bypass the EADDRINUSE error
 */

// Set a different port before loading the server
process.env.PORT = 5001;

// Import and run the server
require('./src/server.js'); 