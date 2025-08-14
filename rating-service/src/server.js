require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const ratingRoutes = require('./routes/ratingRoutes');
const { sequelize } = require('./models');
const { connectRedis } = require('./utils/redis');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use('/api/ratings', ratingRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'rating-service', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    // Check Redis connection
    const redis = await connectRedis();
    await redis.ping();
    
    res.status(200).json({ status: 'ready', service: 'rating-service', timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ status: 'not ready', service: 'rating-service', timestamp: new Date().toISOString() });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // Sync database models
    await sequelize.sync();
    logger.info('Database models synchronized.');
    
    // Connect to Redis
    await connectRedis();
    logger.info('Redis connection established successfully.');
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Rating service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
