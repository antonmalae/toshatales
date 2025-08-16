import { logger } from '../utils/logger.js';

// Middleware для логирования запросов с дополнительной информацией
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Логируем начало запроса
  logger.info(`Request started: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Перехватываем завершение запроса
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Логируем результат запроса
    logger.info(`Request completed: ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode: status,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Специальное логирование для rate limiting
    if (status === 429) {
      logger.warn(`Rate limit exceeded: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }

    // Логирование медленных запросов
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

// Middleware для логирования ошибок
export const errorLogger = (err, req, res, next) => {
  logger.error(`Request error: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  next(err);
};

// Middleware для логирования batch операций
export const batchLogger = (req, res, next) => {
  if (req.path.includes('/batch') || req.body?.operations) {
    logger.info(`Batch operation started: ${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      operationCount: req.body?.operations?.length || 0,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}; 