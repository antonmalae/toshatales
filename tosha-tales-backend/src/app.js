import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import rate limiters
import { apiLimiter, getLimiter } from './middleware/rateLimit.js';

// Import routes
import authRoutes from './routes/auth.js';
import storyRoutes from './routes/stories.js';
import characterRoutes from './routes/characters.js';
import categoryRoutes from './routes/categories.js';
import roleRoutes from './routes/roles.js';
import userRoutes from './routes/users.js';
import mediaRoutes from './routes/media.js';
import searchRoutes from './routes/search.js';
import illustrationRoutes from './routes/illustrations.js';
import statisticsRoutes from './routes/statistics.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger, errorLogger, batchLogger } from './middleware/requestLogger.js';
import { logger } from './utils/logger.js';

// Import database connection
import './config/database.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - temporarily relaxed for development
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));

// CORS configuration
const allowedOriginsEnv = process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173,https://tosha-tales.ru,https://www.tosha-tales.ru';
const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/', getLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Custom request logging middleware
app.use(requestLogger);
app.use(batchLogger);

// Static files with CORS headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use('/lovable-uploads', express.static(path.join(__dirname, '../public/lovable-uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Special route for images with proper CORS headers
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, '../public/lovable-uploads', filename);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Type', 'image/*');
  
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stories', illustrationRoutes);
app.use('/api/admin/statistics', statisticsRoutes);

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'Tosha Tales API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      stories: '/api/stories',
      characters: '/api/characters',
      categories: '/api/categories',
      roles: '/api/roles',
      media: '/api/media',
      search: '/api/search',
      illustrations: '/api/stories/:storyId/illustrations',
      admin: {
        statistics: '/api/admin/statistics',
      },
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 Tosha Tales API is ready!`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📖 API docs: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app; 