const { AppError } = require('../utils/errors');
const config = require('../config');

/**
 * Global error handling middleware.
 * Must be registered AFTER all routes: app.use(errorHandler);
 */
const errorHandler = (err, _req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let isOperational = err.isOperational || false;

  // Zod validation errors that slip through
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    isOperational = true;
  }

  // PostgreSQL unique-violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with that value already exists';
    isOperational = true;
  }

  // Log non-operational (unexpected) errors in development
  if (!isOperational) {
    console.error('❌  Unhandled Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && !isOperational && { stack: err.stack }),
  });
};

module.exports = errorHandler;
