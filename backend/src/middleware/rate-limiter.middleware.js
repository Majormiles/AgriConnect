const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter middleware
 * @param {Number} maxRequests - Maximum number of requests allowed
 * @param {Number} windowMinutes - Time window in minutes
 * @param {String} message - Error message to display
 * @returns {Function} Rate limiter middleware
 */
const createRateLimiter = (maxRequests, windowMinutes, message) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

// Auth rate limiters
const loginLimiter = createRateLimiter(
  10, // 10 requests
  15, // per 15 minutes
  'Too many login attempts, please try again after 15 minutes.'
);

const registerLimiter = createRateLimiter(
  5, // 5 requests
  60, // per 60 minutes (1 hour)
  'Too many registration attempts, please try again after 1 hour.'
);

const forgotPasswordLimiter = createRateLimiter(
  3, // 3 requests
  60, // per 60 minutes (1 hour)
  'Too many password reset requests, please try again after 1 hour.'
);

const verifyEmailLimiter = createRateLimiter(
  10, // 10 requests
  60, // per 60 minutes (1 hour)
  'Too many email verification attempts, please try again after 1 hour.'
);

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  verifyEmailLimiter
}; 