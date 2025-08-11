const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Store rate limit info in memory (use Redis in production)
  store: new rateLimit.MemoryStore(),
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Skip failed requests (to avoid blocking legitimate users)
  skipFailedRequests: false,
  // Key generator function
  keyGenerator: (req) => {
    // Use IP address as key, but you could also use user ID if authenticated
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Handler for when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Please try again later',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 / 60) || 15
    });
  }
});

// Rate limiter for general API endpoints
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new rateLimit.MemoryStore(),
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

// Rate limiter for password reset
const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new rateLimit.MemoryStore(),
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

module.exports = {
  authRateLimit,
  apiRateLimit,
  passwordResetRateLimit
}; 