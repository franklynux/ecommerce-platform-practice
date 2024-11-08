// backend/src/index.js
import app from './app.js';
import config from './config/environment.js';
import connectDB from './config/database.js';

const start = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Start server
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();