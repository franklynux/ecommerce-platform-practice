import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import configureSecurityMiddleware from './middleware/security.js';

const app = express();

// Apply basic middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('dev'));

// Apply security middleware
configureSecurityMiddleware(app);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Routes

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
      const dbState = mongoose.connection.readyState;
      const dbStatus = {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
      };

      res.status(200).json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'backend',
          database: {
              status: dbStatus[dbState],
              healthy: dbState === 1
          }
      });
  } catch (error) {
      res.status(500).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
      });
  }
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Pet Accessories API' });
});

/*
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
*/

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;