const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for auth endpoints — prevents brute-force / credential stuffing.
 *  - 15 requests per minute per IP on login/register/forgot-password
 */
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute',
  },
});

/**
 * Stricter limiter for password-reset requests — 5 per 15 minutes.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests, please try again later',
  },
});

/**
 * General API limiter — 100 requests per minute per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

module.exports = { authLimiter, passwordResetLimiter, apiLimiter };
