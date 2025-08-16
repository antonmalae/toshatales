import rateLimit from 'express-rate-limit';

// Адаптивный rate limiter для API запросов
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 200, // увеличиваем лимит
  message: {
    success: false,
    error: 'Слишком много запросов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Добавляем кастомные заголовки
  handler: (req, res) => {
    res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(req.rateLimit.resetTime / 1000));
    res.status(429).json({
      success: false,
      error: 'Слишком много запросов. Попробуйте позже.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Улучшенный rate limiter для операций с иллюстрациями
export const illustrationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 150, // увеличиваем лимит для batch операций
  message: {
    success: false,
    error: 'Слишком много операций с иллюстрациями. Подождите немного.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Кастомный обработчик для иллюстраций
  handler: (req, res) => {
    res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(req.rateLimit.resetTime / 1000));
    res.status(429).json({
      success: false,
      error: 'Слишком много операций с иллюстрациями. Подождите немного.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Rate limiter для batch операций
export const batchLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 минуты
  max: 50, // максимум 50 batch операций за 2 минуты
  message: {
    success: false,
    error: 'Слишком много batch операций. Подождите немного.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(req.rateLimit.resetTime / 1000));
    res.status(429).json({
      success: false,
      error: 'Слишком много batch операций. Подождите немного.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Rate limiter для загрузки файлов
export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 30, // увеличиваем лимит
  message: {
    success: false,
    error: 'Слишком много загрузок файлов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(req.rateLimit.resetTime / 1000));
    res.status(429).json({
      success: false,
      error: 'Слишком много загрузок файлов. Попробуйте позже.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Rate limiter для аутентификации
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // увеличиваем лимит
  message: {
    success: false,
    error: 'Слишком много попыток входа. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(req.rateLimit.resetTime / 1000));
    res.status(429).json({
      success: false,
      error: 'Слишком много попыток входа. Попробуйте позже.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Rate limiter для GET запросов (более мягкий)
export const getLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 300, // много GET запросов
  message: {
    success: false,
    error: 'Слишком много запросов. Попробуйте позже.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('X-RateLimit-Remaining', req.rateLimit.remaining);
    res.setHeader('X-RateLimit-Reset', Math.floor(req.rateLimit.resetTime / 1000));
    res.status(429).json({
      success: false,
      error: 'Слишком много запросов. Попробуйте позже.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
}); 