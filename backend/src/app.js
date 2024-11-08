// backend/src/app.js
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

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Security middleware
configureSecurityMiddleware(app);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Pet Accessories API' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;