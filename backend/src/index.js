import app from './app.js';
import config from './config/environment.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const start = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server
    const port = config.port || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start().catch((error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});